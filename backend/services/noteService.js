function getNotes(userId) {
  return fetch(`/api/notes?userId=${userId}`)
    .then((response) => response.json())
    .catch((error) => {
      console.error("Error fetching notes:", error);
      throw error;
    });
}

function getNote(noteId) {
  return fetch("/api/notes/" + noteId)
    .then((response) => response.json())
    .catch((error) => {
      console.error("Error fetching note:", error);
      throw error;
    });
}

function createNote(noteData) {
  return fetch("/api/notes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(noteData),
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error("Error creating note:", error);
      throw error;
    });
}

function updateNote(noteId, noteData) {
  return fetch(`/api/notes/${noteId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(noteData),
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error("Error updating note:", error);
      throw error;
    });
}

function deleteNote(noteId) {
  return fetch(`/api/notes/${noteId}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error deleting note");
      }
    })
    .catch((error) => {
      console.error("Error deleting note:", error);
      throw error;
    });
}

export { getNotes, createNote, updateNote, deleteNote };
