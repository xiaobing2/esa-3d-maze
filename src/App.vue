<template>
  <div class="app">
    <GameCanvas v-if="gameStore.isPlaying" />
    <HudOverlay />
    <MainMenu v-if="!gameStore.isPlaying" />
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from './stores/game'
import GameCanvas from './components/GameCanvas.vue'
import HudOverlay from './components/HudOverlay.vue'
import MainMenu from './components/MainMenu.vue'

const gameStore = useGameStore()
</script>

<style scoped>
.app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
