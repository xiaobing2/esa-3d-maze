/**
 * ESA 边缘函数：生成迷宫配置
 */

export default async function handler(request) {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    // 生成随机种子和迷宫大小
    const seed = Math.random()
    const width = 10
    const height = 10

    return new Response(JSON.stringify({
      seed,
      width,
      height
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (error) {
    console.error('生成迷宫配置失败:', error)
    return new Response(JSON.stringify({
      seed: Math.random(),
      width: 10,
      height: 10
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
}
