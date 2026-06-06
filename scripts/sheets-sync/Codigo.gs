// ============================================================
// Código Stroke — Google Sheets → Supabase sync
// ============================================================
// Setup:
//  1. Extensions → Apps Script → paste this file
//  2. Fill in SUPABASE_SERVICE_KEY and COLUMN_MAP below
//  3. Run setupTrigger() once to enable hourly auto-sync
//  4. Publish as Web App (Execute as: Me, Access: Anyone)
//     and paste the URL as GOOGLE_SYNC_WEBHOOK_URL in dashboard/.env.local
// ============================================================

const SUPABASE_URL = 'PASTE_SUPABASE_URL_HERE' // e.g. https://xxxx.supabase.co
const SUPABASE_SERVICE_KEY = 'PASTE_SERVICE_ROLE_KEY_HERE' // never commit this
const SHEET_NAME = 'Hoja1'   // name of the tab to sync
const SYNCED_COL = 26        // column Z (1-indexed) used as "already synced" marker

// ──────────────────────────────────────────────────────────────
// COLUMN_MAP: map your sheet column index (1-indexed) to the
// corresponding stroke_events field name.
//
// To find column numbers: column A = 1, B = 2, C = 3 …
// Leave null for columns that have no direct mapping or that
// you want to skip.
//
// Accepted values for drug_used: 'rtpa' | 'tnk' (lowercase)
// Timestamps must be in a format JS can parse, e.g. "2026-05-10 08:30"
// ──────────────────────────────────────────────────────────────
const COLUMN_MAP = {
  //  col index  →  stroke_events field
  1:  'door_time',               // fecha/hora de ingreso (ISO or parseable string)
  2:  'patient_alias',           // nombre o iniciales (NEVER full DNI)
  3:  null,                      // DNI (see privacy note below — will be hashed)
  4:  'nihss_score',             // NIHSS al ingreso (integer 0-42)
  5:  'aspects_score',           // ASPECTS (integer 0-10)
  6:  'ct_request_time',         // hora solicitud TC
  7:  'thrombolytic_start_at',   // hora inicio trombolítico
  8:  'angio_request_time',      // hora solicitud angio-TC
  9:  'drug_used',               // 'rtpa' o 'tnk'
  10: 'symptom_onset_time',      // hora inicio síntomas / último visto bien
  // Add more columns as needed following the same pattern.
  // Fields available in stroke_events:
  //   thrombectomy_activation_at, is_wake_up_stroke (true/false),
  //   has_bleeding (true/false), thrombolysis_given (true/false),
  //   thrombectomy_activated (true/false), patient_mrs_score (0-6)
}

// Column index of the DNI field (for hashing). Set to null if not present.
const DNI_COL = 3

// ──────────────────────────────────────────────────────────────
// Internal helpers
// ──────────────────────────────────────────────────────────────

function hashDni_(dni) {
  if (!dni) return null
  const clean = String(dni).replace(/\D/g, '')
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    clean,
    Utilities.Charset.UTF_8
  )
  return bytes.map(b => ('0' + (b & 0xff).toString(16)).slice(-2)).join('')
}

function toIso_(value) {
  if (!value) return null
  if (value instanceof Date) return value.toISOString()
  const d = new Date(value)
  return isNaN(d.getTime()) ? null : d.toISOString()
}

function buildRow_(rowValues, rowIndex, date) {
  const row = { source: 'sheets_import' }

  for (const [colStr, field] of Object.entries(COLUMN_MAP)) {
    if (!field) continue
    const val = rowValues[parseInt(colStr) - 1]
    if (val === '' || val === null || val === undefined) continue

    if (field.endsWith('_time') || field.endsWith('_at')) {
      row[field] = toIso_(val)
    } else if (field === 'nihss_score' || field === 'aspects_score' || field === 'patient_mrs_score') {
      const n = parseInt(val)
      row[field] = isNaN(n) ? null : n
    } else if (field === 'is_wake_up_stroke' || field === 'has_bleeding' ||
               field === 'thrombolysis_given' || field === 'thrombectomy_activated') {
      row[field] = Boolean(val)
    } else {
      row[field] = String(val).trim()
    }
  }

  // Hash DNI if present
  if (DNI_COL) {
    const dni = rowValues[DNI_COL - 1]
    if (dni) row.patient_dni_hash = hashDni_(dni)
  }

  // Build a stable external_id for deduplication
  const dateStr = row.door_time
    ? row.door_time.slice(0, 10)
    : (date instanceof Date ? Utilities.formatDate(date, 'UTC', 'yyyy-MM-dd') : String(rowIndex))
  const alias = (row.patient_alias || 'row' + rowIndex).replace(/\s+/g, '').slice(0, 10)
  row.external_id = `${dateStr}_${alias}`

  return row
}

// ──────────────────────────────────────────────────────────────
// Main sync function
// ──────────────────────────────────────────────────────────────

function syncAll() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
  if (!sheet) throw new Error('Sheet "' + SHEET_NAME + '" not found')

  const lastRow = sheet.getLastRow()
  if (lastRow < 2) return // header only

  const dataRange = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn())
  const values = dataRange.getValues()
  const syncedValues = sheet.getRange(2, SYNCED_COL, lastRow - 1, 1).getValues()

  const toSync = []
  const rowIndexes = []

  for (let i = 0; i < values.length; i++) {
    if (syncedValues[i][0] === 'OK') continue
    const row = buildRow_(values[i], i + 2, values[i][0])
    if (row.external_id) {
      toSync.push(row)
      rowIndexes.push(i)
    }
  }

  if (toSync.length === 0) {
    Logger.log('Nothing to sync.')
    return
  }

  const endpoint = SUPABASE_URL + '/rest/v1/stroke_events'
  const headers = {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY,
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates',
  }

  for (let j = 0; j < toSync.length; j++) {
    const options = {
      method: 'post',
      headers: headers,
      payload: JSON.stringify(toSync[j]),
      muteHttpExceptions: true,
    }
    const resp = UrlFetchApp.fetch(endpoint, options)
    const code = resp.getResponseCode()

    if (code === 200 || code === 201 || code === 204) {
      sheet.getRange(rowIndexes[j] + 2, SYNCED_COL).setValue('OK')
    } else {
      Logger.log('Row ' + (rowIndexes[j] + 2) + ' failed (' + code + '): ' + resp.getContentText())
    }
  }

  Logger.log('Sync complete. Processed ' + toSync.length + ' rows.')
}

// ──────────────────────────────────────────────────────────────
// Web app endpoint — for manual "Sync now" button in JutopaBoard
// Publish as Web App (Execute as: Me, Access: Anyone)
// ──────────────────────────────────────────────────────────────

function doGet() {
  try {
    syncAll()
    return ContentService.createTextOutput('ok')
  } catch (e) {
    return ContentService.createTextOutput('error: ' + e.message)
  }
}

// ──────────────────────────────────────────────────────────────
// Run this once to set up the hourly trigger
// ──────────────────────────────────────────────────────────────

function setupTrigger() {
  // Remove existing triggers to avoid duplicates
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'syncAll')
    .forEach(t => ScriptApp.deleteTrigger(t))

  ScriptApp.newTrigger('syncAll')
    .timeBased()
    .everyHours(1)
    .create()

  Logger.log('Hourly trigger created.')
}
