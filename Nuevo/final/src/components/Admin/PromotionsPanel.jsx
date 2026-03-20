import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { useToast } from "../../context/ToastContext";
import ConfirmModal from "../Shared/ConfirmModal";

function PromotionsPanel() {
  const [promotions, setPromotions] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [minVisits, setMinVisits] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editMinVisits, setEditMinVisits] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [promoToDelete, setPromoToDelete] = useState(null);
  const [formError, setFormError] = useState("");
  const [editError, setEditError] = useState("");
  const toast = useToast();

  const fetchPromotions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("promotions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando promociones:", error.message);
      toast.error("Error al cargar promociones");
    } else {
      setPromotions(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("promotions")
        .select("*")
        .order("created_at", { ascending: false });
      if (!cancelled) {
        if (error) {
          console.error("Error cargando promociones:", error.message);
          toast.error("Error al cargar promociones");
        } else {
          setPromotions(data ?? []);
        }
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const createPromotion = async (e) => {
    e.preventDefault();
    setFormError("");

    const titleTrim = (title ?? "").trim();
    const descTrim = (description ?? "").trim();
    if (!titleTrim) {
      setFormError("Ingresa un título para la promoción.");
      return;
    }
    if (!descTrim) {
      setFormError("Ingresa una descripción para la promoción.");
      return;
    }
    if (!minVisits || minVisits < 1) {
      setFormError("Las visitas mínimas deben ser al menos 1.");
      return;
    }

    const { error } = await supabase.from("promotions").insert({
      title: titleTrim,
      description: descTrim,
      min_visits: minVisits,
      active: true,
    });

    if (error) {
      console.error("Error creando promoción:", error.message);
      toast.error("Error al crear promoción");
    } else {
      toast.success("Promoción creada correctamente");
      setTitle("");
      setDescription("");
      setMinVisits(1);
      fetchPromotions();
    }
  };

  const togglePromotion = async (id, currentState) => {
    const { error } = await supabase
      .from("promotions")
      .update({ active: !currentState })
      .eq("id", id);

    if (error) {
      console.error("Error cambiando estado:", error.message);
      toast.error("Error al cambiar estado");
    } else {
      toast.success(currentState ? "Promoción desactivada" : "Promoción activada");
      fetchPromotions();
    }
  };

  const openEdit = (promo) => {
    setEditId(promo.id);
    setEditTitle(promo.title);
    setEditDescription(promo.description ?? "");
    setEditMinVisits(promo.min_visits ?? 1);
  };

  const closeEdit = () => {
    setEditId(null);
    setEditError("");
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editId) return;
    setEditError("");

    const titleTrim = (editTitle ?? "").trim();
    const descTrim = (editDescription ?? "").trim();
    if (!titleTrim) {
      setEditError("Ingresa un título para la promoción.");
      return;
    }
    if (!descTrim) {
      setEditError("Ingresa una descripción para la promoción.");
      return;
    }
    if (!editMinVisits || editMinVisits < 1) {
      setEditError("Las visitas mínimas deben ser al menos 1.");
      return;
    }

    const { error } = await supabase
      .from("promotions")
      .update({
        title: titleTrim,
        description: descTrim,
        min_visits: editMinVisits,
      })
      .eq("id", editId);

    if (error) {
      console.error("Error editando promoción:", error.message);
      toast.error("Error al guardar cambios");
    } else {
      toast.success("Promoción actualizada");
      closeEdit();
      fetchPromotions();
    }
  };

  const openDeleteModal = (promo) => {
    setPromoToDelete(promo);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!promoToDelete) return;

    const { error } = await supabase.from("promotions").delete().eq("id", promoToDelete.id);

    if (error) {
      console.error("Error eliminando promoción:", error.message);
      toast.error("Error al eliminar promoción");
    } else {
      toast.success("Promoción eliminada");
      fetchPromotions();
    }
    setPromoToDelete(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-neutral-500">Cargando promociones...</p>
      </div>
    );
  }

  return (
    <div className="max-w-full overflow-hidden">
      <h2 className="text-lg sm:text-xl font-semibold text-neutral-900 tracking-tight mb-1">Panel de promociones</h2>
      <p className="text-neutral-500 text-sm mb-4 sm:mb-6">Crea y gestiona promociones por visitas.</p>

      <form onSubmit={createPromotion} className="card-neutral p-4 sm:p-5 mb-4 sm:mb-6 bg-neutral-50 border-neutral-200">
        <h3 className="text-sm font-medium text-neutral-700 mb-3">Nueva promoción</h3>
        {formError && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700 mb-3" role="alert">
            {formError}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Título</label>
            <input
              type="text"
              className="input-neutral py-2"
              placeholder="Ej. 5 visitas"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setFormError(""); }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Descripción</label>
            <input
              type="text"
              className="input-neutral py-2"
              placeholder="Detalle de la promoción"
              value={description}
              onChange={(e) => { setDescription(e.target.value); setFormError(""); }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Visitas mínimas</label>
            <input
              type="number"
              min={1}
              className="input-neutral py-2"
              value={minVisits}
              onChange={(e) => { setMinVisits(Number(e.target.value)); setFormError(""); }}
            />
          </div>
          <button type="submit" className="btn-neutral py-2 w-full sm:w-auto min-h-[2.75rem]">
            Crear promoción
          </button>
        </div>
      </form>

      <ul className="space-y-3">
        {promotions.map((promo) => (
          <li key={promo.id} className="card-neutral p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {editId === promo.id ? (
              <form onSubmit={saveEdit} className="flex-1 flex flex-col gap-3">
                {editError && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700" role="alert">
                    {editError}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Título</label>
                    <input
                      type="text"
                      className="input-neutral py-2"
                      value={editTitle}
                      onChange={(e) => { setEditTitle(e.target.value); setEditError(""); }}
                    />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Descripción</label>
                  <input
                    type="text"
                    className="input-neutral py-2"
                    value={editDescription}
                    onChange={(e) => { setEditDescription(e.target.value); setEditError(""); }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Visitas mínimas</label>
                  <input
                    type="number"
                    min={1}
                    className="input-neutral py-2"
                    value={editMinVisits}
                    onChange={(e) => { setEditMinVisits(Number(e.target.value)); setEditError(""); }}
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-neutral py-2 text-sm min-h-[2.75rem]">
                    Guardar
                  </button>
                  <button type="button" className="btn-neutral-outline py-2 text-sm min-h-[2.75rem]" onClick={closeEdit}>
                    Cancelar
                  </button>
                </div>
                </div>
              </form>
            ) : (
              <>
                <div className="min-w-0">
                  <p className="font-medium text-neutral-900">{promo.title}</p>
                  <p className="text-sm text-neutral-600 mt-0.5">{promo.description}</p>
                  <p className="text-xs text-neutral-500 mt-1">Mín. {promo.min_visits} visitas</p>
                  <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${promo.active ? "bg-neutral-200 text-neutral-700" : "bg-neutral-100 text-neutral-500"}`}>
                    {promo.active ? "Activa" : "Inactiva"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => togglePromotion(promo.id, promo.active)}
                    className={`${promo.active ? "btn-neutral-outline" : "btn-neutral"} py-2 text-sm min-h-[2.75rem] flex-1 sm:flex-initial min-w-[7rem]`}
                  >
                    {promo.active ? "Desactivar" : "Activar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(promo)}
                    className="btn-neutral-outline py-2 text-sm min-h-[2.75rem] flex-1 sm:flex-initial min-w-[7rem]"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => openDeleteModal(promo)}
                    className="btn-neutral-outline py-2 text-sm text-neutral-600 min-h-[2.75rem] flex-1 sm:flex-initial min-w-[7rem]"
                  >
                    Eliminar
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setPromoToDelete(null); }}
        onConfirm={handleConfirmDelete}
        title="Eliminar promoción"
        message="¿Seguro que quieres eliminar esta promoción? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
      />
    </div>
  );
}

export default PromotionsPanel;
