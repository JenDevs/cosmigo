import { defineStore } from "pinia";
import { onMounted, ref } from "vue";

export const useNotesStore = defineStore("notes", () => {
  const notes = ref([]);
  const activeNote = ref(notes.value[0] || null);
  const isSaving = ref(false);
  const mockUserId = 1;

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
      const raw = await res.json();
      notes.value = raw.map((n) => ({
        //raw iffy
        id: n.noteId,
        title: n.noteTitle,
        content: n.noteContent,
        userId: n.userId,
        updatedAt: n.updatedAt ? new Date(n.updatedAt).getTime() : 0,
      }));
      notes.value.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
      console.log("Fetched Notes:", notes.value);
      const prevId = activeNote.value?.id;
      if (prevId) {
        const found = notes.value.find((n) => n.id === prevId);
        activeNote.value = found || notes.value[0] || null;
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

  return {
    notes,
    activeNote,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    selectNote,
  };
});
