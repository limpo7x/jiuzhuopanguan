export interface RuntimeLocation {
  address: string
  city: string
  district: string
  label: string
  latitude: number | null
  longitude: number | null
  province: string
  source: 'fuzzy' | 'gps'
}

const STORAGE_KEY = 'jzp-runtime-location'

type GenericLocationPayload = Record<string, unknown>

const normalizeText = (value: unknown) => String(value || '').trim()

const normalizeNumber = (value: unknown) => {
  const next = Number(value)
  return Number.isFinite(next) ? next : null
}

const hasChinese = (value: string) => /[\u4e00-\u9fff]/.test(value)

const isNumericLike = (value: string) => /^[\d\s,.\-_/]+$/.test(value)

const normalizeRegionText = (value: unknown) => {
  const text = normalizeText(value)
  if (!text || isNumericLike(text)) {
    return ''
  }
  return text
}

const pickReadableAddress = (...values: unknown[]) => {
  for (const value of values) {
    const text = normalizeRegionText(value)
    if (text && hasChinese(text)) {
      return text
    }
  }
  return ''
}

const joinUniqueParts = (...values: string[]) =>
  values.filter((value, index, list) => value && list.indexOf(value) === index).join('')

const buildLabel = (payload: GenericLocationPayload) => {
  const city = normalizeRegionText(payload.city || payload.locality)
  const district = normalizeRegionText(payload.district || payload.town || payload.street)
  const province = normalizeRegionText(payload.province || payload.region)
  const address = pickReadableAddress(payload.address, payload.formattedAddress, payload.name)
  const cityDistrict = joinUniqueParts(city, district)

  if (cityDistrict && hasChinese(cityDistrict)) {
    return cityDistrict
  }

  if (city && hasChinese(city)) {
    return city
  }

  if (joinUniqueParts(province, city) && hasChinese(joinUniqueParts(province, city))) {
    return joinUniqueParts(province, city)
  }

  if (address) {
    return address
  }

  return ''
}

const normalizeLocation = (payload: GenericLocationPayload, source: RuntimeLocation['source']): RuntimeLocation => ({
  address: pickReadableAddress(payload.address, payload.formattedAddress, payload.name),
  city: normalizeRegionText(payload.city || payload.locality),
  district: normalizeRegionText(payload.district || payload.town || payload.street),
  label: buildLabel(payload),
  latitude: normalizeNumber(payload.latitude),
  longitude: normalizeNumber(payload.longitude),
  province: normalizeRegionText(payload.province || payload.region),
  source,
})

const callLocationApi = (fn: (options: Record<string, unknown>) => void, options: Record<string, unknown>) =>
  new Promise<GenericLocationPayload>((resolve, reject) => {
    fn({
      ...options,
      success: (result: GenericLocationPayload) => resolve(result || {}),
      fail: reject,
    })
  })

export const getStoredRuntimeLocation = (): RuntimeLocation | null => {
  const raw = wx.getStorageSync(STORAGE_KEY) as Partial<RuntimeLocation> | undefined
  if (!raw || typeof raw !== 'object') {
    return null
  }

  const normalized = normalizeLocation(raw as GenericLocationPayload, raw.source === 'fuzzy' ? 'fuzzy' : 'gps')
  if (!normalized.label && normalized.latitude === null && normalized.longitude === null) {
    return null
  }
  return normalized
}

export const setStoredRuntimeLocation = (location: RuntimeLocation) => {
  wx.setStorageSync(STORAGE_KEY, location)
  return location
}

export const requestRuntimeLocation = async (): Promise<RuntimeLocation | null> => {
  const fuzzyApi = (wx as WechatMiniprogram.Wx & {
    getFuzzyLocation?: (options: Record<string, unknown>) => void
  }).getFuzzyLocation

  if (typeof fuzzyApi === 'function') {
    try {
      const fuzzyResult = await callLocationApi(fuzzyApi.bind(wx), {})
      const normalized = normalizeLocation(fuzzyResult, 'fuzzy')
      if (normalized.label || normalized.latitude !== null || normalized.longitude !== null) {
        return setStoredRuntimeLocation(normalized)
      }
    } catch {
      // Fall through to precise location.
    }
  }

  try {
    const preciseResult = await callLocationApi(wx.getLocation.bind(wx), { type: 'gcj02' })
    const normalized = normalizeLocation(preciseResult, 'gps')
    if (normalized.label || normalized.latitude !== null || normalized.longitude !== null) {
      return setStoredRuntimeLocation(normalized)
    }
  } catch {
    return getStoredRuntimeLocation()
  }

  return getStoredRuntimeLocation()
}
