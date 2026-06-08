const http = require('http')
const url = require('url')
const { compliance, getHomeConfig, profile, toolHistory, updateHomeHero } = require('./data/home')
const {
  addFriend,
  ensureProfile,
  getBootstrap,
  ignorePoke,
  replyPoke,
  sendPoke,
  searchProfiles,
  touchFriends,
  updateFriend,
  removeFriend,
} = require('./data/social')

const port = Number(process.env.PORT || 3010)

const send = (response, data, statusCode = 200) => {
  response.writeHead(statusCode, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    })
  response.end(
    JSON.stringify({
      code: 0,
      message: 'ok',
      data,
    })
  )
}

const readJsonBody = (request) =>
  new Promise((resolve, reject) => {
    let raw = ''

    request.on('data', (chunk) => {
      raw += chunk
    })

    request.on('end', () => {
      if (!raw) {
        resolve({})
        return
      }

      try {
        resolve(JSON.parse(raw))
      } catch (error) {
        reject(error)
      }
    })

    request.on('error', reject)
  })

const server = http.createServer((request, response) => {
  const respond = async () => {
  if (!request.url) {
    send(response, { error: 'missing url' }, 400)
    return
  }

  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    })
    response.end()
    return
  }

  const { pathname, query } = url.parse(request.url, true)

  if (request.method === 'GET' && pathname === '/api/v1/config/home') {
    send(response, getHomeConfig())
    return
  }

  if (request.method === 'GET' && pathname === '/api/v1/admin/config/home') {
    send(response, getHomeConfig())
    return
  }

  if (request.method === 'GET' && pathname === '/api/v1/config/compliance') {
    send(response, compliance)
    return
  }

  if (request.method === 'GET' && pathname === '/api/v1/user/profile') {
    send(response, profile)
    return
  }

  if (request.method === 'GET' && pathname === '/api/v1/tools/history') {
    send(response, toolHistory)
    return
  }

  if (request.method === 'PUT' && pathname === '/api/v1/admin/config/home/hero') {
    try {
      const payload = await readJsonBody(request)
      const hero = updateHomeHero(payload)
      send(response, {
        hero,
        updatedAt: new Date().toISOString(),
      })
    } catch (error) {
      send(
        response,
        {
          error: 'invalid json body',
        },
        400
      )
    }
    return
  }

  if (request.method === 'POST' && pathname === '/api/v1/admin/upload/home-hero') {
    send(response, {
      uploaded: false,
      fieldName: 'file',
      message: 'upload route reserved; connect this endpoint to your object storage service and then call /api/v1/admin/config/home/hero to persist imageUrl',
      nextAction: '/api/v1/admin/config/home/hero',
    })
    return
  }

  if (request.method === 'GET' && pathname === '/api/v1/social/bootstrap') {
    send(response, getBootstrap(String(query.profileId || '')))
    return
  }

  if (request.method === 'GET' && pathname === '/api/v1/social/users/search') {
    send(
      response,
      searchProfiles({
        ownerId: String(query.profileId || ''),
        keyword: String(query.keyword || ''),
      }),
    )
    return
  }

  if (request.method === 'PUT' && pathname === '/api/v1/social/profile') {
    try {
      const payload = await readJsonBody(request)
      send(response, ensureProfile(payload))
    } catch (error) {
      send(response, { error: error instanceof Error ? error.message : 'invalid profile payload' }, 400)
    }
    return
  }

  if (request.method === 'POST' && pathname === '/api/v1/social/friends') {
    try {
      const payload = await readJsonBody(request)
      send(response, addFriend(payload))
    } catch (error) {
      send(response, { error: error instanceof Error ? error.message : 'invalid friend payload' }, 400)
    }
    return
  }

  if (request.method === 'POST' && pathname === '/api/v1/social/friends/touch') {
    try {
      const payload = await readJsonBody(request)
      send(response, touchFriends(payload))
    } catch (error) {
      send(response, { error: error instanceof Error ? error.message : 'invalid touch payload' }, 400)
    }
    return
  }

  if (pathname && pathname.startsWith('/api/v1/social/friends/')) {
    const friendshipId = pathname.replace('/api/v1/social/friends/', '')

    if (request.method === 'PUT') {
      try {
        const payload = await readJsonBody(request)
        send(response, updateFriend({ ...payload, friendshipId }))
      } catch (error) {
        send(response, { error: error instanceof Error ? error.message : 'invalid friend update payload' }, 400)
      }
      return
    }

    if (request.method === 'DELETE') {
      send(response, removeFriend({ ownerId: String(query.profileId || ''), friendshipId }))
      return
    }
  }

  if (request.method === 'POST' && pathname === '/api/v1/social/pokes') {
    try {
      const payload = await readJsonBody(request)
      send(response, sendPoke(payload))
    } catch (error) {
      send(response, { error: error instanceof Error ? error.message : 'invalid poke payload' }, 400)
    }
    return
  }

  if (pathname && pathname.startsWith('/api/v1/social/pokes/')) {
    const segments = pathname.split('/').filter(Boolean)
    const threadId = segments[4]
    const action = segments[5]

    if (request.method === 'POST' && action === 'reply') {
      try {
        const payload = await readJsonBody(request)
        send(response, replyPoke({ profileId: payload.profileId, threadId }))
      } catch (error) {
        send(response, { error: error instanceof Error ? error.message : 'invalid poke reply payload' }, 400)
      }
      return
    }

    if (request.method === 'DELETE' && threadId) {
      send(response, ignorePoke({ profileId: String(query.profileId || ''), threadId }))
      return
    }
  }

  send(response, { error: 'not found' }, 404)
  }

  respond().catch((error) => {
    send(
      response,
      {
        error: error instanceof Error ? error.message : 'internal server error',
      },
      500
    )
  })
})

server.listen(port, () => {
  console.log(`jiuzhuopanguan backend listening on port ${port}`)
})
