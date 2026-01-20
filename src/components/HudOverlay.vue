<template>
  <div v-if="gameStore.isPlaying" class="hud-overlay">
    <div class="hud-top">
      <div class="hud-item">
        <span class="hud-label">时间</span>
        <span class="hud-value">{{ formatTime(gameStore.time) }}</span>
      </div>
      <div class="hud-item">
        <span class="hud-label">分数</span>
        <span class="hud-value">{{ gameStore.score }}</span>
      </div>
      <div class="hud-item">
        <span class="hud-label">碎片</span>
        <span class="hud-value">{{ gameStore.fragments }} / {{ gameStore.totalFragments }}</span>
      </div>
    </div>

    <div v-if="gameStore.isPaused" class="pause-overlay">
      <div class="pause-content">
        <h2>游戏暂停</h2>
        <button @click="resumeGame" class="btn-primary">继续游戏</button>
        <button @click="quitGame" class="btn-secondary">退出游戏</button>
      </div>
    </div>

    <div class="hud-bottom">
      <div class="controls-hint">
        <p>WASD/方向键: 移动 | Q/E: 旋转</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '../stores/game'

const gameStore = useGameStore()

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function resumeGame() {
  gameStore.resumeGame()
}

function quitGame() {
  gameStore.endGame()
}
</script>

<style scoped>
.hud-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
}

.hud-top {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  gap: 30px;
}

.hud-item {
  background: rgba(0, 0, 0, 0.7);
  padding: 12px 20px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hud-label {
  font-size: 12px;
  color: #aaa;
  text-transform: uppercase;
}

.hud-value {
  font-size: 20px;
  font-weight: bold;
  color: #fff;
}

.pause-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: all;
}

.pause-content {
  text-align: center;
  background: rgba(26, 26, 46, 0.95);
  padding: 40px;
  border-radius: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.pause-content h2 {
  margin-bottom: 30px;
  font-size: 32px;
  color: #fff;
}

.pause-content button {
  margin: 10px;
  padding: 12px 30px;
  font-size: 16px;
  border-radius: 8px;
  cursor: pointer;
  border: none;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

.hud-bottom {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.controls-hint {
  background: rgba(0, 0, 0, 0.7);
  padding: 8px 16px;
  border-radius: 6px;
  color: #aaa;
  font-size: 12px;
}
</style>
