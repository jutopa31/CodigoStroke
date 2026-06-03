"use client";

export const dynamic = "force-dynamic";

import { useState, FormEvent } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!supabase) {
      setError("Supabase no configurado. Completá NEXT_PUBLIC_SUPABASE_URL en .env.local.");
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError("Credenciales incorrectas. Verificá email y contraseña.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#132B58] text-white text-xl font-black tracking-tight shadow-[0_4px_12px_rgba(19,43,88,0.25)]">
            ACV
          </span>
          <h1 className="mt-4 text-xl font-bold text-[#132B58]">Código Stroke</h1>
          <p className="text-sm text-[#A8B6D6] mt-1">Analytics — Acceso admin</p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] p-6 space-y-4"
        >
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-medium text-[#132B58]">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[#F0F0F0] bg-[#FAFAFA] px-3 py-2.5 text-sm text-[#132B58] placeholder:text-[#A8B6D6] outline-none focus:border-[#244B99] focus:ring-2 focus:ring-[#244B99]/20 transition"
              placeholder="medico@hospital.org"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-xs font-medium text-[#132B58]">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[#F0F0F0] bg-[#FAFAFA] px-3 py-2.5 text-sm text-[#132B58] placeholder:text-[#A8B6D6] outline-none focus:border-[#244B99] focus:ring-2 focus:ring-[#244B99]/20 transition"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#132B58] text-white py-2.5 text-sm font-semibold hover:bg-[#10264F] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Ingresando…
              </>
            ) : (
              "Iniciar sesión"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
