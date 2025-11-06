<script setup>
import NoteItem from "./NoteItem.vue";

const props = defineProps({
  notes: { type: Array, required: true },
});
const emit = defineEmits(["delete", "select"]);

const noteEls = new Map();

function scrollToNoteId(id) {
  const el = noteEls.get(id);
  if (!el) return;
  el.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
    inline: "nearest",
  });
  el.classList.add("flash");
  setTimeout(() => el.classList.remove("flash"), 800);
}

defineExpose({ scrollToNoteId });
</script>

<template>
  <div class="note-list">
    <div class="edge-fade top" aria-hidden="true" />
    <ul v-if="notes && notes.length" role="list" aria-label="List of notes">
      <NoteItem
        v-for="note in notes"
        :key="note.id"
        :note="note"
        @select="emit('select', $event)"
        @delete="emit('delete', $event)"
        :ref="
          (vm) => {
            const el = vm && vm.$el;
            if (el) noteEls.set(note.id, el);
            else noteEls.delete(note.id);
          }
        "
      />
    </ul>
    <p class="no-notes" v-else>No notes yet... 🦗</p>
    <div class="edge-fade bottom" aria-hidden="true" />
  </div>
</template>

<style scoped>
.note-list {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  scrollbar-gutter: stable both-edges;
}

.note-list ul {
  display: grid;
  grid-template-columns: repeat(3, 100px);
  gap: 8px 3px;
  justify-content: center;
  justify-items: center;
  list-style: none;
  padding: 0;
  margin: 0;
  padding-bottom: 18px;
}

.no-notes {
  text-align: center;
  margin: 0;
}

.edge-fade {
  position: sticky;
  left: 0;
  right: 0;
  height: var(--fade-h);
  pointer-events: none;
  z-index: 10;
}

.edge-fade.top {
  top: 0;
  height: 18px;
  background: radial-gradient(
    ellipse 80% 80% at 50% -40%,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.35) 60%,
    rgba(0, 0, 0, 0) 100%
  );
}
.edge-fade.bottom {
  position: sticky;
  bottom: 0;
  height: 18px;
  pointer-events: none;
  background: radial-gradient(
    ellipse 80% 80% at 50% 140%,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.35) 60%,
    rgba(0, 0, 0, 0) 100%
  );
}

.note-item.flash {
  background: rgba(255, 230, 85, 0.5);
  border-radius: 10px;
  transition: background 0.2s;
}
</style>
