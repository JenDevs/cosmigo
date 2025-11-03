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
    <div class="edge-fade top" aria-hidden="true"></div>
    <ul role="listbox" aria-label="List of notes">
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
    <div class="edge-fade bottom" aria-hidden="true"></div>
  </div>
</template>

<style scoped>
.note-list {
  position: relative;
  max-height: 320px;
  border-radius: 12px;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-gutter: stable both-edges;
  scrollbar-width: none;
}
.edge-fade {
  position: sticky;
  left: 0;
  right: 0;
  height: 20px;
  pointer-events: none;
  z-index: 2;
}
.edge-fade.top {
  top: 0;
  background: radial-gradient(
    ellipse 80% 80% at 50% -40%,
    rgba(0, 0, 0, 0.4) 50%,
    rgba(0, 0, 0, 0.3) 40%,
    rgba(0, 0, 0, 0) 100%
  );
}
.edge-fade.bottom {
  bottom: 0;
  background: radial-gradient(
    ellipse 80% 70% at 50% 140%,
    rgba(0, 0, 0, 0.6) 0%,
    rgba(0, 0, 0, 0.3) 30%,
    rgba(0, 0, 0, 0) 100%
  );
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
}
.note-item.flash {
  padding: 0;
  background: rgba(255, 230, 85, 0.5);
  border-radius: 10px;
  transition: all 0.2s;
}
</style>
