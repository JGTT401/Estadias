import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";

function PromotionsPanel() {
  const [promotions, setPromotions] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [minVisits, setMinVisits] = useState(1);
  const [loading, setLoading] = useState(true);

  // Cargar todas las promociones
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
    fetchPromotions();
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

  if (loading) return <p>Cargando promociones...</p>;

  return (
    <div>
      <h2>Panel de Promociones</h2>

      <form onSubmit={createPromotion} className="mb-4">
        <input
          type="text"
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="border p-2 mr-2"
        />
        <input
          type="text"
          placeholder="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="border p-2 mr-2"
        />
        <input
          type="number"
          placeholder="Visitas mínimas"
          value={minVisits}
          onChange={(e) => setMinVisits(Number(e.target.value))}
          required
          className="border p-2 mr-2"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">
          Crear
        </button>
      </form>

      <ul>
        {promotions.map((promo) => (
          <li key={promo.id} className="border p-2 mb-2">
            <strong>{promo.title}</strong> - {promo.description}
            <br />
            <em>Visitas mínimas: {promo.min_visits}</em>
            <br />
            Estado: {promo.active ? "Activa ✅" : "Inactiva ❌"}
            <br />
            <button
              onClick={() => togglePromotion(promo.id, promo.active)}
              className={`px-3 py-1 mt-2 ${
                promo.active ? "bg-red-500" : "bg-green-500"
              } text-white mr-2`}
            >
              {promo.active ? "Desactivar" : "Activar"}
            </button>
            <button
              onClick={() => deletePromotion(promo.id)}
              className="px-3 py-1 mt-2 bg-gray-700 text-white"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PromotionsPanel;
