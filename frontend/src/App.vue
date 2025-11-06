<script setup>
import { ref } from 'vue';
import PomodoroTimer from './components/PomodoroTimer.vue'
import Sidebar from "./components/Sidebar.vue";
import Workspace from "./components/Workspace.vue";

const showTimer = ref(false);

const showSidebar = ref(true);

function toggleSidebar() {
  showSidebar.value = !showSidebar.value;
}
</script>
<template>

  <button class="toggleSidebarButton" @click="toggleSidebar">
  <img v-if="showSidebar" 
  src="@/assets/icons/circle-x.svg"
  alt="Hide sidebar" />
  <img v-else src="@/assets/icons/square-menu.svg"
  alt="Show sidebar" />
  </button>

  <div class="layout" :class="{ 'sidebar-hidden': !showSidebar, 'sidebar-visible': showSidebar}">
    <Sidebar class="sidebar" />
    <Workspace class="workspace" />
  </div>

  <div v-show="showTimer" class="timer-wrapper">
    <PomodoroTimer />
  </div>


  
  <button
   @click="showTimer = !showTimer"
    class="floatingClockButton"
   :class="{ 'is-solid': showTimer }"
   :aria-pressed="showTimer"
>
   <img
      v-if="!showTimer"
     src="@/assets/icons/alarm-clock.svg"
     alt="Show timer"
      class="clockIcon"
    />
   <img
     v-else
     src="@/assets/icons/alarm-clock-off.svg"
     alt="Hide timer"
     class="clockIcon"
    />
  </button>


  
</template>

<style>
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: rgb(13, 9, 27); 
  background-color: transparent;
  color: #fff;
  font-family: system-ui, sans-serif;
  background-image:url('/src/assets/images/skyhorizontal.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  /* cursor*/ 
  cursor: url('/src/assets/cursor/pcursor.png') 64 64 , auto;
}

#cursor {
    position: fixed;
    z-index: 1000001;
    left: 0;
    top: 0;
    pointer-events: none;
    will-change: transform;
    transform: translate(-50%, -50%);
}

#cursor png {
    width: 20px;
    height: 20px;
    transition: 0.3s;
}

.layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: #2b2b2b;
}

.sidebar {
  flex: 0 0 300px;
  z-index: 500;
  /*background-color: transparent;*/
}

.sidebar {
  box-shadow:
    4px 0 10px rgba(0, 0, 0, 0.1),
    10px 0 30px rgba(0, 0, 0, 0.2);
}



.workspace {
  flex: 1;
  background-color: #2b2b2b;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow-y: auto;
  padding: 1rem;
}

.note-view,
.quiz-view {
  width: 100%;
  max-width: 700px;
  background-color: #3a3a3a;
  border-radius: 10px;
  padding: 1rem;
  box-sizing: border-box;
  color: #fff;
}

h1 {
  color: white;
  text-align: center;
  font-size: 3rem;
  margin: 0;
  padding: 1rem;
}

header {
  line-height: 1.5;
}


button {
  background-color: white;
}

.floatingClockButton {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: rgba(197, 187, 209, 0.2);
  border: 2px solid black;
  border-radius: 50%;
  width: 62px;
  height: 62px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  cursor: pointer;
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.floatingClockButton:hover {
  transform: scale(1.1);
  background-color: rgba(197, 187, 209, 0.5);
}

.floatingClockButton:active {
  transform: scale(0.95);
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
}

.floatingClockButton.is-solid {
  background-color: rgba(197, 187, 209, 0.85);
}

.floatingClockButton.is-solid:hover {
  background-color: rgba(197, 187, 209, 1);
}


.clockIcon {
  width: 35px;
  height: 35px;
}

.floatingClockButton img {
  width: 70%;
  height: auto;
}

.timer-wrapper {
  position: fixed;
  top: 16px;       
  right: 16px;    
  z-index: 1050; 
  background: none;
  padding: 0;
  margin: 0;
  pointer-events: auto;
  display: inline-block;
}

.toggleSidebarButton {
  display: none;
}

@media (max-width: 768px) {
  .toggleSidebarButton {
    display: flex;
    position: fixed;
    top: 12px;
    right: 12px; 
    z-index: 1100;
    background-color: white;
    color: white;
    border: 2px solid black;
    border-radius: 50%;
    padding: 8px;
    width: 45px;
    height: 45px;
    justify-content: center;
    align-items: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    cursor: pointer;
  }

  .sidebar {
    transition: transform 0.3s ease;
    width: 260px;
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    background-color: #2b2b2b;
    z-index: 1000;
  }

  .sidebar-hidden .sidebar {
    transform: translateX(-100%);
  }

  .sidebar-hidden .workspace {
    width: 100%;
  }

  .workspace {
    flex: 1;
    margin-left: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding-top: 80px;
    padding-bottom: 120px;
  }
  
  .note-view,
  .quiz-view {
    width: 95%;
    max-width: 700px;
    height: auto;
    min-height: 70vh;
    font-size: 0.95rem;
    margin: 0 auto;
    border-radius: 10px;
  }

   .quiz-layout {
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 1rem;
    width: 100%;
  }
  
  .editor-panel,
  .quizzes-container {
    width: 90%;
    max-width: 370px;
    background-color: rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    margin-left: auto;
    margin-right: auto;
    padding: 1rem;
    box-sizing: border-box;
  }
  
   .editor-panel {
    border: none !important;
    padding-left: 1rem !important;
    padding-right: 1rem !important;
  }
  
  .quizzes-container {
    border: none !important;
    padding-left: 1rem !important;
    padding-right: 1rem !important;
  }
  
  .quizzes-header {
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.2);
    padding: 8px 10px;
  }

  .quiz-editor {
    width: 95% !important;
    max-width: 450px !important;
    margin: 40px auto 0 !important;
    padding: 14px !important;
    background-color: #56565c !important;
    border-radius: 10px !important;
  }

   .timer-wrapper {
    top: auto !important;      
    bottom: 110px;            
    right: 20px;
    transform: scale(0.85);
    transform-origin: bottom right;
    position: fixed;
    z-index: 1000;
  }
}

</style>
