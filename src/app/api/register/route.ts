import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { userId, nombre } = await req.json();

    if (!userId || !nombre) {
      return NextResponse.json({ error: "userId y nombre son requeridos" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("profiles").upsert({
      id: userId,
      nombre,
      role: "vendedor",
      aprobado: false,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
