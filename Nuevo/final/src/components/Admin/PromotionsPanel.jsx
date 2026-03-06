import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";

function PromotionsPanel() {
  const [promotions, setPromotions] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [minVisits, setMinVisits] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchPromotions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("promotions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando promociones:", error.message);
    } else {
      setPromotions(data);
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
        if (error) console.error("Error cargando promociones:", error.message);
        else setPromotions(data ?? []);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Crear nueva promoción
  const createPromotion = async (e) => {
    e.preventDefault();

    const { error } = await supabase.from("promotions").insert({
      title,
      description,
      min_visits: minVisits,
      active: true,
    });

    if (error) {
      console.error("Error creando promoción:", error.message);
    } else {
      alert("Promoción creada correctamente");
      setTitle("");
      setDescription("");
      setMinVisits(1);
      fetchPromotions();
    }
  };

  // Cambiar estado de una promoción
  const togglePromotion = async (id, currentState) => {
    const { error } = await supabase
      .from("promotions")
      .update({ active: !currentState })
      .eq("id", id);

    if (error) {
      console.error("Error cambiando estado:", error.message);
    } else {
      fetchPromotions();
    }
  };

  // Eliminar promoción
  const deletePromotion = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta promoción?")) return;

    const { error } = await supabase.from("promotions").delete().eq("id", id);

    if (error) {
      console.error("Error eliminando promoción:", error.message);
    } else {
      alert("Promoción eliminada");
      fetchPromotions();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-neutral-500">Cargando promociones...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-neutral-900 tracking-tight mb-1">Panel de promociones</h2>
      <p className="text-neutral-500 text-sm mb-6">Crea y gestiona promociones por visitas.</p>

      <form onSubmit={createPromotion} className="card-neutral p-5 mb-6 bg-neutral-50 border-neutral-200">
        <h3 className="text-sm font-medium text-neutral-700 mb-3">Nueva promoción</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Título</label>
            <input
              type="text"
              className="input-neutral py-2"
              placeholder="Ej. 5 visitas"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Descripción</label>
            <input
              type="text"
              className="input-neutral py-2"
              placeholder="Detalle de la promoción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Visitas mínimas</label>
            <input
              type="number"
              min={1}
              className="input-neutral py-2"
              value={minVisits}
              onChange={(e) => setMinVisits(Number(e.target.value))}
              required
            />
          </div>
          <button type="submit" className="btn-neutral py-2">
            Crear promoción
          </button>
        </div>
      </form>

      <ul className="space-y-3">
        {promotions.map((promo) => (
          <li key={promo.id} className="card-neutral p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium text-neutral-900">{promo.title}</p>
              <p className="text-sm text-neutral-600 mt-0.5">{promo.description}</p>
              <p className="text-xs text-neutral-500 mt-1">Mín. {promo.min_visits} visitas</p>
              <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${promo.active ? "bg-neutral-200 text-neutral-700" : "bg-neutral-100 text-neutral-500"}`}>
                {promo.active ? "Activa" : "Inactiva"}
              </span>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => togglePromotion(promo.id, promo.active)}
                className={promo.active ? "btn-neutral-outline py-2 text-sm" : "btn-neutral py-2 text-sm"}
              >
                {promo.active ? "Desactivar" : "Activar"}
              </button>
              <button
                type="button"
                onClick={() => deletePromotion(promo.id)}
                className="btn-neutral-outline py-2 text-sm text-neutral-600"
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PromotionsPanel;
