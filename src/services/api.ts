/**
 * API 服务
 */

const EDGE_FUNCTION_URL = import.meta.env.VITE_EDGE_FUNCTION_URL || ''

export interface MazeConfig {
  seed: number
  width: number
  height: number
}

export interface RankItem {
  name: string
  time: number
  date: string
}

export async function getMazeConfig(): Promise<MazeConfig> {
  if (!EDGE_FUNCTION_URL) {
    // 模拟数据
    return {
      seed: Math.random(),
      width: 10,
      height: 10
    }
  }

  try {
    const res = await fetch(`${EDGE_FUNCTION_URL}/maze`)
    if (!res.ok) throw new Error('获取迷宫配置失败')
    return await res.json()
  } catch (error) {
    console.warn('边缘函数调用失败，使用默认配置:', error)
    return {
      seed: Math.random(),
      width: 10,
      height: 10
    }
  }
}

export async function submitRank(name: string, time: number): Promise<void> {
  if (!EDGE_FUNCTION_URL) {
    console.log('边缘函数未配置，跳过排行榜提交')
    return
  }

  try {
    await fetch(`${EDGE_FUNCTION_URL}/rank`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, time })
    })
  } catch (error) {
    console.error('提交排行榜失败:', error)
  }
}

export async function getRankList(): Promise<RankItem[]> {
  if (!EDGE_FUNCTION_URL) {
    return []
  }

  try {
    const res = await fetch(`${EDGE_FUNCTION_URL}/rank`)
    if (!res.ok) throw new Error('获取排行榜失败')
    return await res.json()
  } catch (error) {
    console.error('获取排行榜失败:', error)
    return []
  }
}
