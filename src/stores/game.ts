import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface RankItem {
  name: string
  time: number
  date: string
}

export const useGameStore = defineStore('game', () => {
  const isPlaying = ref(false)
  const isPaused = ref(false)
  const isGameOver = ref(false)
  const score = ref(0)
  const time = ref(0)
  const fragments = ref(0)
  const totalFragments = ref(5)
  const playerName = ref('')
  const rankList = ref<RankItem[]>([])

  function startGame() {
    isPlaying.value = true
    isPaused.value = false
    isGameOver.value = false
    score.value = 0
    time.value = 0
    fragments.value = 0
  }

  function pauseGame() {
    isPaused.value = true
  }

  function resumeGame() {
    isPaused.value = false
  }

  function endGame() {
    isPlaying.value = false
    isGameOver.value = true
  }

  function collectFragment() {
    fragments.value++
    score.value += 100
  }

  function updateTime(seconds: number) {
    time.value = seconds
  }

  function setRankList(ranks: RankItem[]) {
    rankList.value = ranks
  }

  return {
    isPlaying,
    isPaused,
    isGameOver,
    score,
    time,
    fragments,
    totalFragments,
    playerName,
    rankList,
    startGame,
    pauseGame,
    resumeGame,
    endGame,
    collectFragment,
    updateTime,
    setRankList
  }
})
