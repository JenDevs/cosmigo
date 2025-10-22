import { ref } from "vue";

const notes = ref([
  { id: 1, title: "Note 1", content: "Content for Note 1" },
  { id: 2, title: "Note 2", content: "Content for Note 2" },
  { id: 3, title: "Note 3", content: "Content for Note 3" },
]);

const activeNote = ref(null);

export function useNotes() {
  function selectNote(id) {
    activeNote.value = notes.value.find((n) => n.id === id);
    console.log("Selected Note:", activeNote.value);
  }

  function createNote() {
    const newId = notes.value.length
      ? Math.max(...notes.value.map((n) => n.id)) + 1
      : 1;
    const newNote = { id: newId, title: `Note ${newId}`, content: "" };
    notes.value.push(newNote);
    activeNote.value = newNote;
    console.log("Created Note:", newNote);
  }

  function deleteNote(id) {
    notes.value = notes.value.filter((n) => n.id !== id);
    if (activeNote.value?.id === id) activeNote.value = null;
    console.log("Deleted Note ID:", id);
  }

  return { notes, activeNote, selectNote, createNote, deleteNote };
}
