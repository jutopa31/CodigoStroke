import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import Sidebar from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Bypass de auth para datos mock: con NEXT_PUBLIC_AUTH_BYPASS=true se entra sin login.
  // Apagar (quitar la var o ponerla en false) cuando haya datos/usuarios reales.
  if (process.env.NEXT_PUBLIC_AUTH_BYPASS === "true") {
    return (
      <div className="flex h-screen bg-[#F0F2F5] overflow-hidden">
        <Sidebar userName="Demo (mock)" />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    );
  }

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/login");

  return (
    <div className="flex h-screen bg-[#F0F2F5] overflow-hidden">
      <Sidebar userName={profile?.display_name ?? user.email ?? undefined} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
