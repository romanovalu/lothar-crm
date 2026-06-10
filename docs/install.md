# Instalacion

Este workspace ya contiene la estructura del proyecto. Como la descarga de dependencias npm no fue aprobada durante la creacion, para ejecutar la app Next hay que instalar paquetes cuando tengas red habilitada.

```powershell
cd "C:\Users\roman\OneDrive\Documentos\GESTION LOTHAR"
npm install
npm run dev
```

Luego abrir:

```text
http://localhost:3000
```

## Supabase

1. Crear un proyecto en Supabase.
2. Ejecutar `supabase/schema.sql` en el SQL Editor.
3. Copiar `.env.example` a `.env.local`.
4. Completar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Demo sin instalar

La demo estatica esta en `demo/index.html` y permite validar la experiencia visual sin Next ni npm.
