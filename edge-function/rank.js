/**
 * ESA 边缘函数：排行榜管理
 */

// 模拟存储（实际应使用 OSS 或数据库）
let rankData = []

export default async function handler(request) {
  const { method } = request

  // 设置 CORS 头
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  }

  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    })
  }

  try {
    if (method === 'GET') {
      // 获取排行榜
      const sortedRanks = rankData
        .sort((a, b) => a.time - b.time)
        .slice(0, 10) // 只返回前10名

      return new Response(JSON.stringify(sortedRanks), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      })
    } else if (method === 'POST') {
      // 提交成绩
      const body = await request.json()
      const { name, time } = body

      if (!name || typeof time !== 'number') {
        return new Response(JSON.stringify({ error: 'Invalid data' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        })
      }

      const newRank = {
        name: name.substring(0, 20),
        time: Math.floor(time),
        date: new Date().toISOString()
      }

      rankData.push(newRank)
      rankData = rankData.sort((a, b) => a.time - b.time).slice(0, 100) // 保留前100名

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      })
    } else {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      })
    }
  } catch (error) {
    console.error('排行榜操作失败:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })
  }
}
