const IPV4_MAPPED_IPV6_PREFIX = '::ffff:'

function normalizeValue(value) {
    if (value === undefined || value === null) return ''
    return String(value).trim().toLowerCase()
}

function getComparableIpValues(value) {
    const normalizedIp = normalizeValue(value)
    if (!normalizedIp) return []

    const comparableValues = new Set([normalizedIp])

    if (normalizedIp.startsWith(IPV4_MAPPED_IPV6_PREFIX)) {
        comparableValues.add(normalizedIp.slice(IPV4_MAPPED_IPV6_PREFIX.length))
    } else if (normalizedIp.includes('.') && !normalizedIp.includes(':')) {
        comparableValues.add(`${IPV4_MAPPED_IPV6_PREFIX}${normalizedIp}`)
    }

    return [...comparableValues]
}

export function getRequestIp(request) {
    return request.ip || request.socket?.remoteAddress || ''
}

export function getRequestOrigin(request) {
    const origin = request.headers?.origin
    return typeof origin === 'string' ? origin.trim() : ''
}

export function isEnabledList(values) {
    return Array.isArray(values) && values.length > 0
}

export function matchesIpRule(requestIp, rules) {
    const requestIpValues = new Set(getComparableIpValues(requestIp))
    if (requestIpValues.size === 0) return false

    return rules.some((rule) => {
        const ruleValues = getComparableIpValues(rule)
        return ruleValues.some((ruleValue) => requestIpValues.has(ruleValue))
    })
}

export function matchesValueRule(value, rules) {
    const normalizedValue = normalizeValue(value)
    if (!normalizedValue) return false

    return rules.some((rule) => normalizeValue(rule) === normalizedValue)
}

export function getRequestIdentifiers(user) {
    if (!user || typeof user !== 'object') return []

    const identifiers = [user.id, user.email]
        .filter((value) => typeof value === 'string' && value.trim().length > 0)
        .map((value) => normalizeValue(value))

    return [...new Set(identifiers)]
}
