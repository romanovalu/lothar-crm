"use client";

import { useRef, useState } from "react";
import { Paperclip, X, Loader2, FileText, Image } from "lucide-react";
import { createClient } from "@/lib/supabase";

export interface Adjunto {
  nombre: string;
  url: string;
  tipo: string;
  tamaño: number;
}

interface Props {
  adjuntos: Adjunto[];
  onChange: (adjuntos: Adjunto[]) => void;
  label?: string;
  maxArchivos?: number;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUpload({ adjuntos, onChange, label = "Adjuntar archivos", maxArchivos = 5 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (adjuntos.length + files.length > maxArchivos) {
      setError(`Máximo ${maxArchivos} archivos por ticket.`);
      return;
    }

    setUploading(true);
    setError(null);
    const supabase = createClient();
    const nuevos: Adjunto[] = [...adjuntos];

    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) {
        setError(`"${file.name}" supera los 10 MB.`);
        continue;
      }

      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("ticket-attachments")
        .upload(path, file, { upsert: false });

      if (uploadError) {
        setError(`Error al subir "${file.name}": ${uploadError.message}`);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("ticket-attachments")
        .getPublicUrl(path);

      nuevos.push({
        nombre: file.name,
        url: urlData.publicUrl,
        tipo: file.type,
        tamaño: file.size,
      });
    }

    onChange(nuevos);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeAdjunto(idx: number) {
    onChange(adjuntos.filter((_, i) => i !== idx));
  }

  function isImage(tipo: string) {
    return tipo.startsWith("image/");
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">{label}</p>

      {/* Zona de drop / botón */}
      <div
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 px-4 py-5 transition hover:border-lothar-yellow hover:bg-yellow-50"
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
      >
        {uploading ? (
          <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
        ) : (
          <Paperclip className="h-6 w-6 text-neutral-400" />
        )}
        <p className="text-sm text-neutral-500">
          {uploading ? "Subiendo..." : "Arrastrá archivos o hacé click para seleccionar"}
        </p>
        <p className="text-xs text-neutral-400">
          JPG, PNG, PDF, Excel · Hasta 10 MB por archivo · Máx. {maxArchivos} archivos
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.xlsx,.xls"
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}

      {/* Lista de archivos adjuntos */}
      {adjuntos.length > 0 && (
        <div className="space-y-2">
          {adjuntos.map((adj, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2.5">
              {isImage(adj.tipo) ? (
                <Image className="h-4 w-4 shrink-0 text-blue-500" />
              ) : (
                <FileText className="h-4 w-4 shrink-0 text-neutral-500" />
              )}
              <div className="min-w-0 flex-1">
                <a
                  href={adj.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-sm font-medium text-neutral-800 hover:text-lothar-black hover:underline"
                >
                  {adj.nombre}
                </a>
                <p className="text-xs text-neutral-400">{formatBytes(adj.tamaño)}</p>
              </div>
              <button
                type="button"
                onClick={() => removeAdjunto(i)}
                className="shrink-0 rounded p-1 text-neutral-400 hover:bg-red-50 hover:text-red-500"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* Componente de solo lectura para mostrar adjuntos en el detalle del ticket */
export function AdjuntosViewer({ adjuntos }: { adjuntos: Adjunto[] }) {
  if (!adjuntos || adjuntos.length === 0) return null;

  function isImage(tipo: string) {
    return tipo.startsWith("image/");
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Archivos adjuntos</p>
      <div className="space-y-2">
        {adjuntos.map((adj, i) => (
          <a
            key={i}
            href={adj.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 transition hover:border-lothar-yellow hover:bg-yellow-50"
          >
            {isImage(adj.tipo) ? (
              <Image className="h-4 w-4 shrink-0 text-blue-500" />
            ) : (
              <FileText className="h-4 w-4 shrink-0 text-neutral-500" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-neutral-800">{adj.nombre}</p>
              <p className="text-xs text-neutral-400">{formatBytes(adj.tamaño)}</p>
            </div>
            <span className="text-xs text-neutral-400">Ver →</span>
          </a>
        ))}
      </div>

      {/* Preview de imágenes */}
      {adjuntos.some(a => isImage(a.tipo)) && (
        <div className="flex flex-wrap gap-2 pt-1">
          {adjuntos.filter(a => isImage(a.tipo)).map((adj, i) => (
            <a key={i} href={adj.url} target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={adj.url}
                alt={adj.nombre}
                className="h-20 w-20 rounded-lg object-cover border border-neutral-200 hover:opacity-80 transition"
              />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
