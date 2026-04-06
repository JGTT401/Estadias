import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { useToast } from "../../context/ToastContext";

export default function AdminHome() {
  const [stats, setStats] = useState({
    users: null,
    scansToday: null,
    promotionsActive: null,
  });
  const [images, setImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const toast = useToast();

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
      reader.readAsDataURL(file);
    });
  }

  const fetchImages = useCallback(async () => {
    setImagesLoading(true);
    const { data, error } = await supabase
      .from("home_images")
      .select("id, image_data, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando imágenes de home:", error);
      toast.error("No se pudieron cargar las imágenes del home.");
      setImages([]);
    } else {
      setImages(data ?? []);
    }
    setImagesLoading(false);
  }, [toast]);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);

    Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase
        .from("scans")
        .select("id", { count: "exact", head: true })
        .gte("created_at", `${today}T00:00:00`)
        .lt("created_at", `${today}T23:59:59.999`),
      supabase
        .from("promotions")
        .select("id", { count: "exact", head: true })
        .eq("active", true),
    ]).then(([usersRes, scansRes, promosRes]) => {
      setStats({
        users: usersRes.count ?? 0,
        scansToday: scansRes.count ?? 0,
        promotionsActive: promosRes.count ?? 0,
      });
    });
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  async function handleUploadImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");

    if (!file.type?.startsWith("image/")) {
      setUploadError("Solo se permiten archivos de imagen.");
      e.target.value = "";
      return;
    }

    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setUploadError("La imagen supera el límite de 5MB.");
      e.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const imageData = await fileToDataUrl(file);
      const { error } = await supabase
        .from("home_images")
        .insert({ image_data: imageData });

      if (error) {
        console.error("Error subiendo imagen:", error);
        toast.error("No se pudo subir la imagen.");
      } else {
        toast.success("Imagen subida correctamente.");
        await fetchImages();
      }
    } catch (err) {
      console.error(err);
      toast.error("No se pudo procesar la imagen.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDeleteImage(id) {
    const { error } = await supabase.from("home_images").delete().eq("id", id);

    if (error) {
      console.error("Error eliminando imagen:", error);
      toast.error("No se pudo eliminar la imagen.");
      return;
    }
    toast.success("Imagen eliminada.");
    setImages((prev) => prev.filter((img) => img.id !== id));
  }

  return (
    <div className="max-w-full overflow-hidden">
      <h2 className="text-lg sm:text-xl font-semibold text-neutral-900 tracking-tight">Panel de control</h2>
      <p className="text-neutral-500 text-sm mt-1 mb-4 sm:mb-6">Resumen y estadísticas</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="card-neutral p-4 sm:p-5">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Usuarios totales</p>
          <p className="mt-2 text-2xl font-bold text-neutral-900 tabular-nums">{stats.users !== null ? stats.users : "—"}</p>
        </div>
        <div className="card-neutral p-4 sm:p-5 bg-neutral-50 border-neutral-200">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Escaneos hoy</p>
          <p className="mt-2 text-2xl font-bold text-neutral-900 tabular-nums">{stats.scansToday !== null ? stats.scansToday : "—"}</p>
        </div>
        <div className="card-neutral p-4 sm:p-5">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Promociones activas</p>
          <p className="mt-2 text-2xl font-bold text-neutral-900 tabular-nums">{stats.promotionsActive !== null ? stats.promotionsActive : "—"}</p>
        </div>
      </div>

      <section className="mt-6 sm:mt-8">
        <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-1">Imágenes para el home de usuario</h3>
        <p className="text-neutral-500 text-sm mb-3 sm:mb-4">
          Sube imágenes para que aparezcan en la pantalla principal de los usuarios.
        </p>

        <div className="card-neutral p-4 sm:p-5 bg-neutral-50 border-neutral-200 mb-4">
          {uploadError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700 mb-3" role="alert">
              {uploadError}
            </div>
          )}
          <label htmlFor="home-image" className="block text-sm font-medium text-neutral-700 mb-1.5">
            Selecciona una imagen
          </label>
          <input
            id="home-image"
            type="file"
            accept="image/*"
            className="input-neutral py-2"
            onChange={handleUploadImage}
            disabled={uploading}
          />
          <p className="text-xs text-neutral-500 mt-2">Formatos: imagen. Tamaño máximo: 5MB.</p>
        </div>

        {imagesLoading ? (
          <p className="text-neutral-500 py-4">Cargando imágenes...</p>
        ) : images.length === 0 ? (
          <p className="text-neutral-500 py-4 text-center">No hay imágenes cargadas todavía.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {images.map((img) => (
              <li key={img.id} className="card-neutral p-3">
                <div className="rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100 aspect-video mb-2">
                  <img src={img.image_data} alt="Imagen del home" className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  className="btn-neutral-outline w-full min-h-[2.5rem] text-sm"
                  onClick={() => handleDeleteImage(img.id)}
                >
                  Eliminar imagen
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
