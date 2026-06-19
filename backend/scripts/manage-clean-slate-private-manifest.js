const fs = require('fs')
const path = require('path')

const { bindWechatUser, readSocialStore, writeSocialStore } = require('../data/social')

const repoRoot = path.resolve(__dirname, '..', '..')

const cleanText = (value = '') => String(value || '').trim()
const nowIso = () => new Date().toISOString()
const maskToken = (value = '') => {
  const text = cleanText(value)
  return text ? `***${text.slice(-8)}` : ''
}

const parseArgs = (argv = process.argv.slice(2)) => {
  const args = {}
  for (let index = 0; index < argv.length; index += 1) {
    const item = String(argv[index] || '')
    if (!item.startsWith('--')) {
      continue
    }
    const key = item.slice(2)
    const next = argv[index + 1]
    if (!next || String(next).startsWith('--')) {
      args[key] = 'true'
      continue
    }
    args[key] = String(next)
    index += 1
  }
  return args
}

const resolvePath = (value, fallback) => {
  const normalized = cleanText(value)
  return path.resolve(repoRoot, normalized || fallback)
}

const writeJsonFile = (filePath, payload) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
}

const readJsonFile = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'))

const normalizeSeed = (value = '') =>
  cleanText(value)
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'prcs-local'

const getRoleSpecs = (seed) => [
  {
    role: 'host',
    envKey: 'PRCS_HOST_TOKEN',
    name: '聚会记录师房主',
    openId: `prcs-clean-slate-${seed}-host`,
  },
  {
    role: 'memberA',
    envKey: 'PRCS_MEMBER_A_TOKEN',
    name: '聚会记录师成员A',
    openId: `prcs-clean-slate-${seed}-member-a`,
  },
  {
    role: 'memberB',
    envKey: 'PRCS_MEMBER_B_TOKEN',
    name: '聚会记录师成员B',
    openId: `prcs-clean-slate-${seed}-member-b`,
  },
  {
    role: 'outsider',
    envKey: 'PRCS_OUTSIDER_TOKEN',
    name: '聚会记录师局外人',
    openId: `prcs-clean-slate-${seed}-outsider`,
  },
]

const createTemplate = (seed) => ({
  id: `prcs-clean-slate-private-manifest-${seed}`,
  generatedAt: nowIso(),
  mode: 'template',
  source: 'local-private-template',
  seed,
  notes: [
    '完整 token 只允许写在私密文件或本机环境变量，不得进入公开文档。',
    '接口联调/测试回报只保留 tokenSuffix。',
    '如需本地直接生成 token，运行 manage-clean-slate-private-manifest.js --mode generate。',
  ],
  env: {
    requiredKeys: ['PRCS_HOST_TOKEN', 'PRCS_MEMBER_A_TOKEN', 'PRCS_MEMBER_B_TOKEN', 'PRCS_OUTSIDER_TOKEN'],
  },
  profiles: getRoleSpecs(seed).reduce((result, item) => {
    result[item.role] = {
      role: item.role,
      name: item.name,
      openIdHint: item.openId,
      profileId: '',
      token: '',
      tokenSuffix: '',
    }
    return result
  }, {}),
})

const createGeneratedManifest = (seed, sessions) => ({
  id: `prcs-clean-slate-private-manifest-${seed}`,
  generatedAt: nowIso(),
  mode: 'generated',
  source: 'local-social-store-bindWechatUser',
  seed,
  notes: [
    '完整 token 只允许保留在本私密文件中。',
    'cleanup 可按同一 seed 执行，清理 profile/userSessions/loginLogs/friendships/pokes 中该批样本。',
    '公开文档只允许引用 tokenSuffix。'
  ],
  env: {
    requiredKeys: ['PRCS_HOST_TOKEN', 'PRCS_MEMBER_A_TOKEN', 'PRCS_MEMBER_B_TOKEN', 'PRCS_OUTSIDER_TOKEN'],
  },
  profiles: sessions,
})

const buildPublicSummary = (manifest) => ({
  id: manifest.id,
  generatedAt: manifest.generatedAt,
  mode: manifest.mode,
  source: manifest.source,
  seed: manifest.seed,
  manifestFile: '',
  profiles: Object.fromEntries(
    Object.entries(manifest.profiles || {}).map(([role, profile]) => [
      role,
      {
        role,
        name: cleanText(profile.name),
        profileId: cleanText(profile.profileId),
        tokenSuffix: maskToken(profile.token || profile.tokenSuffix),
      },
    ]),
  ),
})

const generateLocalManifest = (seed) => {
  const sessions = {}
  getRoleSpecs(seed).forEach((item) => {
    const bound = bindWechatUser({
      wechatOpenId: item.openId,
      profile: {
        name: item.name,
        avatarUrl: '',
        signature: 'PRCS clean slate private manifest',
        identityTag: 'PRCS',
      },
    })
    sessions[item.role] = {
      role: item.role,
      name: bound.profile.name,
      profileId: bound.profile.id,
      openIdHint: item.openId,
      token: bound.token,
      tokenSuffix: maskToken(bound.token),
    }
  })
  return createGeneratedManifest(seed, sessions)
}

const findSeedMatches = (store, seed) => {
  const specs = getRoleSpecs(seed)
  const openIdSet = new Set(specs.map((item) => item.openId))
  const profiles = (store.profiles || []).filter((item) => openIdSet.has(cleanText(item.wechatOpenId)))
  const profileIdSet = new Set(profiles.map((item) => cleanText(item.id)).filter(Boolean))
  const userSessions = (store.userSessions || []).filter((item) => profileIdSet.has(cleanText(item.profileId)))
  const loginLogs = (store.loginLogs || []).filter((item) => profileIdSet.has(cleanText(item.profileId)) || openIdSet.has(cleanText(item.wechatOpenId)))
  const friendships = (store.friendships || []).filter((item) => profileIdSet.has(cleanText(item.ownerId)) || profileIdSet.has(cleanText(item.friendId)))
  const pokes = (store.pokes || []).filter((item) => profileIdSet.has(cleanText(item.senderId)) || profileIdSet.has(cleanText(item.receiverId)))
  return { profiles, userSessions, loginLogs, friendships, pokes, profileIdSet, openIdSet }
}

const inspectSeed = (seed) => {
  const store = readSocialStore()
  const matches = findSeedMatches(store, seed)
  return {
    seed,
    matches: {
      profiles: matches.profiles.map((item) => ({
        profileId: cleanText(item.id),
        name: cleanText(item.name),
        openIdHint: cleanText(item.wechatOpenId),
      })),
      userSessions: matches.userSessions.map((item) => ({
        profileId: cleanText(item.profileId),
        tokenSuffix: maskToken(item.token),
        expiresAt: Number(item.expiresAt) || 0,
      })),
      counts: {
        profiles: matches.profiles.length,
        userSessions: matches.userSessions.length,
        loginLogs: matches.loginLogs.length,
        friendships: matches.friendships.length,
        pokes: matches.pokes.length,
      },
    },
  }
}

const cleanupSeed = (seed) => {
  const store = readSocialStore()
  const matches = findSeedMatches(store, seed)
  const profileIdSet = matches.profileIdSet
  const openIdSet = matches.openIdSet
  const before = {
    profiles: (store.profiles || []).length,
    userSessions: (store.userSessions || []).length,
    loginLogs: (store.loginLogs || []).length,
    friendships: (store.friendships || []).length,
    pokes: (store.pokes || []).length,
  }
  store.profiles = (store.profiles || []).filter((item) => !openIdSet.has(cleanText(item.wechatOpenId)))
  store.userSessions = (store.userSessions || []).filter((item) => !profileIdSet.has(cleanText(item.profileId)))
  store.loginLogs = (store.loginLogs || []).filter((item) => !profileIdSet.has(cleanText(item.profileId)) && !openIdSet.has(cleanText(item.wechatOpenId)))
  store.friendships = (store.friendships || []).filter((item) => !profileIdSet.has(cleanText(item.ownerId)) && !profileIdSet.has(cleanText(item.friendId)))
  store.pokes = (store.pokes || []).filter((item) => !profileIdSet.has(cleanText(item.senderId)) && !profileIdSet.has(cleanText(item.receiverId)))
  writeSocialStore(store)
  const afterStore = readSocialStore()
  const after = {
    profiles: (afterStore.profiles || []).length,
    userSessions: (afterStore.userSessions || []).length,
    loginLogs: (afterStore.loginLogs || []).length,
    friendships: (afterStore.friendships || []).length,
    pokes: (afterStore.pokes || []).length,
  }
  return {
    seed,
    removed: {
      profiles: matches.profiles.length,
      userSessions: matches.userSessions.length,
      loginLogs: matches.loginLogs.length,
      friendships: matches.friendships.length,
      pokes: matches.pokes.length,
    },
    before,
    after,
    residual: inspectSeed(seed).matches.counts,
  }
}

const seedFromManifest = (manifestPath) => {
  const manifest = readJsonFile(manifestPath)
  return normalizeSeed(manifest.seed || manifest.id || '')
}

const main = () => {
  const args = parseArgs()
  const mode = cleanText(args.mode || 'template').toLowerCase()
  const outputPath = resolvePath(args.output, path.join('docs', 'runtime', 'private-manifest.tmp.json'))
  const seed = normalizeSeed(args.seed || (args.manifest ? seedFromManifest(resolvePath(args.manifest, '')) : 'prcs-local'))

  if (mode === 'template') {
    const template = createTemplate(seed)
    writeJsonFile(outputPath, template)
    const summary = buildPublicSummary(template)
    summary.manifestFile = path.basename(outputPath)
    console.log(JSON.stringify(summary, null, 2))
    return
  }

  if (mode === 'generate') {
    const manifest = generateLocalManifest(seed)
    writeJsonFile(outputPath, manifest)
    const summary = buildPublicSummary(manifest)
    summary.manifestFile = path.basename(outputPath)
    summary.cleanup = {
      command: `node backend/scripts/manage-clean-slate-private-manifest.js --mode cleanup --seed ${seed}`,
      residualCheck: `node backend/scripts/manage-clean-slate-private-manifest.js --mode inspect --seed ${seed}`,
    }
    console.log(JSON.stringify(summary, null, 2))
    return
  }

  if (mode === 'inspect') {
    console.log(JSON.stringify(inspectSeed(seed), null, 2))
    return
  }

  if (mode === 'cleanup') {
    console.log(JSON.stringify(cleanupSeed(seed), null, 2))
    return
  }

  throw new Error(`unsupported mode: ${mode}`)
}

main()
