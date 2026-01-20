<template>
  <div class="main-menu">
    <div class="menu-content">
      <h1 class="game-title">🎮 3D 数据迷城</h1>
      <p class="game-subtitle">收集算法碎片，逃离数据迷宫</p>

      <!-- 游戏介绍 -->
      <div class="game-info">
        <p>在一个&nbsp;<strong>10×10&nbsp;数据迷宫</strong>&nbsp;中，你需要收集所有&nbsp;<strong>{{ gameStore.totalFragments }}&nbsp;个金色算法碎片</strong>，然后找到出口逃离。</p>
        <p>电脑端操作：</p>
        <ul>
          <li>W / ↑　向前  S / ↓　向后</li>
          <li>A / ←　向左  D / →　向右</li>
          <li>Q / E　旋转视角</li>
        </ul>
        <p>移动端操作：拖动屏幕前进 / 旋转。</p>
        <p>收集完碎片并抵达右下角出口即可通关并计时上榜！</p>
      </div>

      <div v-if="!gameStore.isGameOver" class="menu-section">
        <input
          v-model="gameStore.playerName"
          type="text"
          placeholder="输入你的名字"
          class="name-input"
          maxlength="20"
        />
        <button @click="startGame" class="btn-start">开始游戏</button>
      </div>

      <div v-else class="game-over-section">
        <h2>🎉 恭喜通关！</h2>
        <div class="stats">
          <p>用时: {{ formatTime(gameStore.time) }}</p>
          <p>分数: {{ gameStore.score }}</p>
        </div>
        <input
          v-model="gameStore.playerName"
          type="text"
          placeholder="输入名字保存记录"
          class="name-input"
          maxlength="20"
        />
        <div class="actions">
          <button @click="submitRank" class="btn-submit">提交成绩</button>
          <button @click="restartGame" class="btn-restart">再来一局</button>
        </div>
      </div>

      <div class="rank-section">
        <h3>🏆 排行榜</h3>
        <div v-if="gameStore.rankList.length === 0" class="no-ranks">
          暂无记录
        </div>
        <div v-else class="rank-list">
          <div
            v-for="(item, index) in gameStore.rankList"
            :key="index"
            class="rank-item"
          >
            <span class="rank-number">{{ index + 1 }}</span>
            <span class="rank-name">{{ item.name }}</span>
            <span class="rank-time">{{ formatTime(item.time) }}</span>
          </div>
        </div>
      </div>

      <div class="footer">
        <p>本项目由阿里云ESA提供加速、计算和保护</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useGameStore } from '../stores/game'
import { submitRank as apiSubmitRank, getRankList } from '../services/api'

const gameStore = useGameStore()

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function startGame() {
  if (!gameStore.playerName.trim()) {
    gameStore.playerName = '玩家' + Math.floor(Math.random() * 1000)
  }
  gameStore.startGame()
}

function restartGame() {
  gameStore.isGameOver = false
  startGame()
}

async function submitRank() {
  if (!gameStore.playerName.trim()) {
    alert('请输入名字')
    return
  }
  await apiSubmitRank(gameStore.playerName, gameStore.time)
  await loadRankList()
  alert('成绩已提交！')
}

async function loadRankList() {
  const ranks = await getRankList()
  gameStore.setRankList(ranks)
}

onMounted(() => {
  loadRankList()
})
</script>

<style scoped>
.main-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.menu-content {
  max-width: 600px;
  width: 90%;
  background: rgba(15, 23, 42, 0.9);
  padding: 40px;
  border-radius: 20px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.game-title {
  font-size: 48px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.game-subtitle {
  text-align: center;
  color: #94a3b8;
  margin-bottom: 40px;
  font-size: 18px;
}

.menu-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;
}

.name-input {
  padding: 14px 20px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.3);
  color: #fff;
  font-size: 16px;
  outline: none;
  transition: all 0.3s;
}

.name-input:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
}

.btn-start,
.btn-submit,
.btn-restart {
  padding: 16px 32px;
  font-size: 18px;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-start {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
}

.btn-start:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.4);
}

.game-over-section {
  margin-bottom: 40px;
}

.game-over-section h2 {
  text-align: center;
  font-size: 32px;
  margin-bottom: 20px;
  color: #60a5fa;
}

.stats {
  text-align: center;
  margin-bottom: 20px;
  font-size: 20px;
  color: #fff;
}

.stats p {
  margin: 8px 0;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.btn-submit {
  flex: 1;
  background: #10b981;
  color: white;
}

.btn-submit:hover {
  background: #059669;
}

.btn-restart {
  flex: 1;
  background: #3b82f6;
  color: white;
}

.btn-restart:hover {
  background: #2563eb;
}

.rank-section {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.rank-section h3 {
  text-align: center;
  font-size: 24px;
  margin-bottom: 20px;
  color: #fff;
}

.no-ranks {
  text-align: center;
  color: #64748b;
  padding: 20px;
}

.rank-list {
  max-height: 300px;
  overflow-y: auto;
}

.rank-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border-left: 3px solid #60a5fa;
}

.rank-number {
  width: 30px;
  font-weight: bold;
  color: #60a5fa;
}

.rank-name {
  flex: 1;
  color: #fff;
}

.rank-time {
  color: #94a3b8;
  font-family: monospace;
}

.footer {
  margin-top: 30px;
  text-align: center;
  color: #64748b;
  font-size: 12px;
}
.game-info {
  background: rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 12px;
  color: #cbd5e1;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 30px;
}

.game-info ul {
  margin: 10px 0 10px 20px;
  list-style: disc;
}

.game-info li {
  margin-bottom: 4px;
}
</style>
