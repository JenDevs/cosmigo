import { defineStore } from "pinia";
import { ref } from "vue";

export const useNotesStore = defineStore("notes", () => {
  const notes = ref([
    { id: 1, title: "First Note", content: "This is a dummy note." },
    { id: 2, title: "Important note", content: "The game." },
    {
      id: 3,
      title: "Happy",
      content: "It finally works!",
    },
  ]);

  const activeNote = ref(notes.value[0] || null);

  // Backend-prepared
  // async function fetchNotes() {
  //   const res = await fetch('/api/notes')
  //   notes.value = await res.json()
  // }
  //
  // async function createNote() {
  //   const res = await fetch('/api/notes', { method: 'POST' })
  //   const newNote = await res.json()
  //   notes.value.push(newNote)
  //   activeNote.value = newNote
  // }

  // Dummy fetch
  function fetchNotes() {
    // No fetch - dummy data for now
  }

  function createNote() {
    const newId = notes.value.length + 1;
    const newNote = { id: newId, title: `New note ${newId}`, content: "" };
    notes.value.push(newNote);
    activeNote.value = newNote;
  }

  function updateNote(updatedNote) {
    const index = notes.value.findIndex((note) => note.id === updatedNote.id);
    if (index !== -1) {
      notes.value[index] = updatedNote;
      activeNote.value = updatedNote;
    }
  }

  function deleteNote(id) {
    notes.value = notes.value.filter((note) => note.id !== id);
    if (activeNote.value?.id === id) {
      activeNote.value = null;
    }

    console.log("Deleted Note ID:", id);
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
