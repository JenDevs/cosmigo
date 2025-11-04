import { defineStore } from "pinia";
import { onMounted, ref } from "vue";

export const useNotesStore = defineStore("notes", () => {
  const notes = ref([]);
  const activeNote = ref(notes.value[0] || null);
  const isSaving = ref(false);
  const mockUserId = 1;

  function normalizeNotesResponse(raw) {
    if (raw == null) return [];
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(raw.notes)) return raw.notes;
    if (typeof raw === "object" && (raw.noteId != null || raw.id != null)) {
      return [raw];
    }
    return [];
  }

  async function fetchNotes() {
    try {
      const res = await fetch(`/api/users/1/notes`);
      if (!res.ok) {
        if (res.status === 404) {
          notes.value = [];
          activeNote.value = null;
          return;
        }
        throw new Error(await res.text());
      }

      let raw;
      try {
        raw = await res.json();
      } catch (e) {
        console.error("Failed to parse JSON from /notes:", e);
        raw = null;
      }

      const list = normalizeNotesResponse(raw);

      const mapped = list
        .map((n) => ({
          id: n.noteId ?? n.id ?? null,
          title: n.noteTitle ?? n.title ?? "",
          content: n.noteContent ?? n.content ?? "",
          userId: n.userId ?? n.user_id ?? 1,
          updatedAt: n.updatedAt ? new Date(n.updatedAt).getTime() : 0,
        }))
        .filter((n) => n.id != null); // prevent shady notes

      mapped.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));

      notes.value = mapped;
      console.log("Fetched Notes (normalized):", notes.value);

      const prevId = activeNote.value?.id;
      if (prevId && notes.value.some((n) => n.id === prevId)) {
        activeNote.value = notes.value.find((n) => n.id === prevId) || null;
      } else {
        activeNote.value = notes.value[0] || null;
      }
    } catch (e) {
      console.error("Failed to fetch notes:", e);
      notes.value = [];
      activeNote.value = null;
    }
  }

  onMounted(fetchNotes);

  async function createNote() {
    const title = "Untitled";
    const content = "This is a new note.";
    await fetch("/api/users/1/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: mockUserId,
        noteTitle: title,
        noteContent: content,
      }),
    });
    await fetchNotes();
    activeNote.value = notes.value[0] || null;
  }

  async function updateNote(updatedNote) {
    const idx = notes.value.findIndex((n) => n.id === updatedNote.id);
    if (idx === -1) return;

    // Store original for rollback
    const original = { ...notes.value[idx] };

    // Optimistic update
    notes.value[idx] = { ...notes.value[idx], ...updatedNote };

    try {
      const res = await fetch(`/api/users/1/notes/${updatedNote.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: mockUserId,
          noteTitle: updatedNote.title,
          noteContent: updatedNote.content,
        }),
      });
      if (!res.ok) throw new Error(await res.text());

      const { success, data } = await res.json();
      if (!success) throw new Error("Update failed");

      const saved = {
        id: data.noteId,
        title: data.noteTitle,
        content: data.noteContent,
        userId: data.userId,
        updatedAt: data.updatedAt
          ? new Date(data.updatedAt).getTime()
          : Date.now(),
      };

      // After optimistic update: ensure correct order
      notes.value.splice(idx, 1);
      notes.value.unshift(saved);
      activeNote.value = notes.value[0];
    } catch (err) {
      console.error("Failed to save note:", err);
      // Rollback optimistic update
      notes.value[idx] = original;
      if (activeNote.value?.id === updatedNote.id) {
        activeNote.value = original;
      }
    }
  }

  async function deleteNote(id) {
    const res = await fetch(`/api/users/1/notes/${id}`, { method: "DELETE" });
    if (!res.ok) {
      console.error("Error deleting note:", await res.text());
      return;
    }
    await fetchNotes();
    activeNote.value = null;
  }

  function selectNote(id) {
    const found = notes.value.find((note) => note.id === id);
    if (found) {
      activeNote.value = found;
      console.log("Selected Note:", found);
    } else {
      console.warn("Note not found for id:", id);
    }
  }

  function getFirstMatchIdByTitle(query) {
    const q = (query || "").trim().toLowerCase();
    if (!q) return null;
    const found = notes.value.find((n) =>
      (n?.title || "").toLowerCase().includes(q)
    );
    return found?.id ?? null;
  }

  return {
    notes,
    activeNote,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    selectNote,
    getFirstMatchIdByTitle,
  };
});
