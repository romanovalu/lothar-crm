import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    // Verificar que quien llama es administrador
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "administrador") {
      return NextResponse.json({ error: "Solo los administradores pueden invitar usuarios" }, { status: 403 });
    }

    const { email, nombre, role, area_responsable } = await req.json();
    if (!email || !nombre) {
      return NextResponse.json({ error: "Email y nombre son requeridos" }, { status: 400 });
    }

    // Usar service role key para operaciones de admin
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json({ error: "Service role key no configurada" }, { status: 500 });
    }

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Invitar al usuario (Supabase envía el email de invitación)
    const { data: inviteData, error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(email, {
      data: { nombre, role: role ?? "vendedor" },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/login`,
    });

    if (inviteError) {
      return NextResponse.json({ error: inviteError.message }, { status: 400 });
    }

    // Crear perfil inmediatamente
    await adminSupabase.from("profiles").upsert({
      id: inviteData.user.id,
      nombre,
      role: role ?? "vendedor",
      area_responsable: area_responsable || null,
    });

    return NextResponse.json({ ok: true, user_id: inviteData.user.id });
  } catch (e) {
    console.error("[invite] Error:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
