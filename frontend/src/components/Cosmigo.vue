<script setup>
import CustomizationModal from "./CustomizationModal.vue";
import { onMounted, ref, computed } from "vue";
import { useCosmigoStore } from "@/stores/useCosmigoStore";
import { COSMIGO_REWARDS } from "@/constants/cosmigoRewards";

const cosmigo = useCosmigoStore();

onMounted(() => {
  cosmigo.fetchProfile();
});

const isModalOpen = ref(false);

function openModal() {
  isModalOpen.value = true;
}
function closeModal() {
  isModalOpen.value = false;
}

const avatarSrc = computed(
  () =>
    COSMIGO_REWARDS[cosmigo.equippedKey]?.src ||
    new URL("../assets/images/cosmigo_happiness.png", import.meta.url).href
);
</script>
<template>
  <div id="cosmigo-component">
    <img
      id="paint-brush"
      src="../assets/icons/paint-brush.png"
      alt="Customization"
      @click="openModal"
    />
    <img id="avatar" :src="avatarSrc" alt="Avatar" />
    <CustomizationModal v-if="isModalOpen" @close="closeModal" />
  </div>
</template>

<style scoped>
#avatar {
  width: 50%;
  margin-bottom: 10px;
}

#avatar:hover {
  cursor: pointer;
  transform: scale(1.05);
  filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.6));
  transition: all 0.1s ease;
}
#cosmigo-component {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

#paint-brush {
  width: 24px;
  align-self: flex-start;
  filter: invert(1);
}

#paint-brush:hover {
  cursor: pointer;
  transform: scale(1.1);
  filter: invert(0.7) sepia(1) saturate(5) hue-rotate(190deg);
  transition: all 0.1s ease;
}
</style>
