import Link from "next/link";
import ManualCaseForm from "@/components/dashboard/ManualCaseForm";

export default function NuevoCasoPage() {
  return (
    <div className="px-4 py-5 sm:px-8 sm:py-6 space-y-4">
      <div>
        <Link
          href="/dashboard/casos"
          className="text-sm text-[#64748B] hover:text-[#132B58] transition-colors"
        >
          ‹ Casos
        </Link>
        <h1 className="text-xl font-bold text-[#132B58] mt-1">Nuevo caso manual</h1>
        <p className="text-sm text-[#334155] mt-0.5">
          Carga retrospectiva de un ACV fuera de ventana / evolucionado
        </p>
      </div>
      <ManualCaseForm />
    </div>
  );
}
