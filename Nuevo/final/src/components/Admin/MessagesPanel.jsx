import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { useToast } from "../../context/ToastContext";
import ConfirmModal from "../Shared/ConfirmModal";

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("es", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MessagesPanel({ adminId }) {
  const [messages, setMessages] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState("");
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editError, setEditError] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const toast = useToast();

  const loadMessageList = useCallback(async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando mensajes:", error.message);
      toast.error("Error al cargar mensajes");
      return [];
    }
    return data ?? [];
  }, [toast]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const list = await loadMessageList();
      if (cancelled) return;
      setMessages(list);
      setListLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadMessageList]);

  const fetchMessages = async () => {
    setListLoading(true);
    const list = await loadMessageList();
    setMessages(list);
    setListLoading(false);
  };

  async function sendMessage() {
    const titleTrim = (title ?? "").trim();
    const bodyTrim = (body ?? "").trim();
    if (!titleTrim || !bodyTrim) {
      setFormError("Completa título y mensaje para enviar.");
      return;
    }
    if (!adminId) {
      toast.error("Error de sesión: no se pudo identificar al administrador.");
      return;
    }

    setFormError("");
    setSending(true);

    const { error: insertError } = await supabase
      .from("messages")
      .insert({ admin_id: adminId, title: titleTrim, body: bodyTrim });

    if (insertError) {
      toast.error(insertError.message);
      setSending(false);
      return;
    }

    setTitle("");
    setBody("");
    toast.success("Mensaje enviado a todos los usuarios");
    setSending(false);
    fetchMessages();
  }

  const openEdit = (msg) => {
    setEditId(msg.id);
    setEditTitle(msg.title ?? "");
    setEditBody(msg.body ?? "");
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
    const bodyTrim = (editBody ?? "").trim();
    if (!titleTrim) {
      setEditError("Ingresa un título.");
      return;
    }
    if (!bodyTrim) {
      setEditError("Ingresa el contenido del mensaje.");
      return;
    }

    const { error } = await supabase
      .from("messages")
      .update({ title: titleTrim, body: bodyTrim })
      .eq("id", editId);

    if (error) {
      console.error("Error editando mensaje:", error.message);
      toast.error("Error al guardar cambios");
    } else {
      toast.success("Mensaje actualizado");
      closeEdit();
      fetchMessages();
    }
  };

  const openDeleteModal = (msg) => {
    setMessageToDelete(msg);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!messageToDelete) return;

    const { error } = await supabase.from("messages").delete().eq("id", messageToDelete.id);

    if (error) {
      console.error("Error eliminando mensaje:", error.message);
      toast.error("Error al eliminar mensaje");
    } else {
      toast.success("Mensaje eliminado");
      fetchMessages();
    }
    setMessageToDelete(null);
  };

  return (
    <div className="max-w-full overflow-hidden">
      <h2 className="text-lg sm:text-xl font-semibold text-neutral-900 tracking-tight mb-1">
        Mensajes a usuarios
      </h2>
      <p className="text-neutral-500 text-sm mb-4 sm:mb-6">
        Envía comunicados, edítalos o elimínalos; los usuarios ven la lista actualizada.
      </p>

      <div className="card-neutral p-4 sm:p-5 mb-4 sm:mb-6 bg-neutral-50 border-neutral-200 max-w-xl">
        <h3 className="text-sm font-medium text-neutral-700 mb-3">Nuevo mensaje</h3>
        {formError && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700 mb-3" role="alert">
            {formError}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label htmlFor="msg-title" className="block text-sm font-medium text-neutral-700 mb-1.5">
              Título
            </label>
            <input
              id="msg-title"
              className="input-neutral"
              placeholder="Asunto del mensaje"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setFormError("");
              }}
            />
          </div>
          <div>
            <label htmlFor="msg-body" className="block text-sm font-medium text-neutral-700 mb-1.5">
              Mensaje
            </label>
            <textarea
              id="msg-body"
              className="input-neutral min-h-[120px] resize-y"
              placeholder="Escribe el contenido..."
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                setFormError("");
              }}
              rows={4}
            />
          </div>
          <button
            type="button"
            className="btn-neutral w-full sm:w-auto min-h-[2.75rem]"
            onClick={sendMessage}
            disabled={sending}
          >
            {sending ? "Enviando..." : "Enviar a todos"}
          </button>
        </div>
      </div>

      <h3 className="text-base font-semibold text-neutral-900 mb-2">Mensajes publicados</h3>
      {listLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-neutral-500">Cargando mensajes...</p>
        </div>
      ) : messages.length === 0 ? (
        <p className="text-neutral-500 py-8 text-center">Aún no hay mensajes.</p>
      ) : (
        <ul className="space-y-3">
          {messages.map((msg) => (
            <li key={msg.id} className="card-neutral p-4 sm:p-5 flex flex-col gap-3">
              {editId === msg.id ? (
                <form onSubmit={saveEdit} className="flex flex-col gap-3">
                  {editError && (
                    <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700" role="alert">
                      {editError}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Título</label>
                    <input
                      type="text"
                      className="input-neutral py-2"
                      value={editTitle}
                      onChange={(e) => {
                        setEditTitle(e.target.value);
                        setEditError("");
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Mensaje</label>
                    <textarea
                      className="input-neutral min-h-[100px] resize-y py-2"
                      value={editBody}
                      onChange={(e) => {
                        setEditBody(e.target.value);
                        setEditError("");
                      }}
                      rows={4}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="submit" className="btn-neutral py-2 text-sm min-h-[2.75rem]">
                      Guardar
                    </button>
                    <button type="button" className="btn-neutral-outline py-2 text-sm min-h-[2.75rem]" onClick={closeEdit}>
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-neutral-900">{msg.title}</p>
                    <p className="text-sm text-neutral-600 mt-1 whitespace-pre-wrap">{msg.body}</p>
                    <p className="text-xs text-neutral-500 mt-2">{formatDate(msg.created_at)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => openEdit(msg)}
                      className="btn-neutral-outline py-2 text-sm min-h-[2.75rem] flex-1 sm:flex-initial min-w-[7rem]"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => openDeleteModal(msg)}
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
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setMessageToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Eliminar mensaje"
        message="¿Seguro que quieres eliminar este mensaje? Los usuarios dejarán de verlo."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
      />
    </div>
  );
}
