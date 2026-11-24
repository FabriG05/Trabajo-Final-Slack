import ENVIRONMENT from '../Config/Environment.config.js'
import ServerError from '../Utils/Error.Utils.js'
import {
    getRequestIdentifiers,
    getRequestIp,
    isEnabledList,
    matchesIpRule,
    matchesValueRule
} from '../Utils/AccessControl.Utils.js'

export function assertNotBlacklistedAuth({ token, user } = {}) {
    if (typeof token === 'string' && token.trim() && isEnabledList(ENVIRONMENT.BLACKLIST_TOKENS)) {
        const isRevokedToken = ENVIRONMENT.BLACKLIST_TOKENS.some((blacklistedToken) => (
            blacklistedToken.trim() === token.trim()
        ))

        if (isRevokedToken) {
            throw new ServerError('Access denied: token has been revoked.', 401)
        }
    }

    if (isEnabledList(ENVIRONMENT.BLACKLIST_IDENTIFIERS)) {
        const identifiers = getRequestIdentifiers(user)
        const isBlacklistedIdentifier = identifiers.some((identifier) => (
            matchesValueRule(identifier, ENVIRONMENT.BLACKLIST_IDENTIFIERS)
        ))

        if (isBlacklistedIdentifier) {
            throw new ServerError('Access denied: user is blacklisted.', 403)
        }
    }
}

function blacklistMiddleware(request, response, next) {
    try {
        if (!isEnabledList(ENVIRONMENT.BLACKLIST_IPS)) {
            return next()
        }

        const requestIp = getRequestIp(request)
        const isBlacklistedIp = matchesIpRule(requestIp, ENVIRONMENT.BLACKLIST_IPS)

        if (isBlacklistedIp) {
            throw new ServerError('Access denied: IP is blacklisted.', 403)
        }

        return next()
    } catch (error) {
        return next(error)
    }
}

export default blacklistMiddleware
