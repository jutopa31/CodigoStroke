import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { USE_MOCK } from "@/lib/queries";
import Sidebar from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userName: string | undefined;

  // En modo mock (demo sin Supabase) se omite el gate de auth.
  if (!USE_MOCK) {
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
    userName = profile?.display_name ?? user.email ?? undefined;
  } else {
    userName = "Demo";
  }

  return (
    <div className="flex h-screen bg-[#F0F2F5] overflow-hidden">
      <Sidebar userName={userName} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
