import ENVIRONMENT from '../Config/Environment.config.js'
import ServerError from '../Utils/Error.Utils.js'
import {
    getRequestIdentifiers,
    getRequestIp,
    getRequestOrigin,
    isEnabledList,
    matchesIpRule,
    matchesValueRule
} from '../Utils/AccessControl.Utils.js'

function hasWhitelistRules() {
    return isEnabledList(ENVIRONMENT.WHITELIST_IPS)
        || isEnabledList(ENVIRONMENT.WHITELIST_ORIGINS)
        || isEnabledList(ENVIRONMENT.WHITELIST_IDENTIFIERS)
}

export function isOriginWhitelisted(origin) {
    if (!ENVIRONMENT.WHITELIST_ENABLED || !isEnabledList(ENVIRONMENT.WHITELIST_ORIGINS)) {
        return true
    }

    if (!origin) {
        return true
    }

    return matchesValueRule(origin, ENVIRONMENT.WHITELIST_ORIGINS)
}

export function assertWhitelistedIdentifier(user) {
    if (!ENVIRONMENT.WHITELIST_ENABLED || !isEnabledList(ENVIRONMENT.WHITELIST_IDENTIFIERS)) {
        return
    }

    const identifiers = getRequestIdentifiers(user)
    const isAllowed = identifiers.some((identifier) => (
        matchesValueRule(identifier, ENVIRONMENT.WHITELIST_IDENTIFIERS)
    ))

    if (!isAllowed) {
        throw new ServerError('Access denied: user is not whitelisted.', 403)
    }
}

function whitelistMiddleware(request, response, next) {
    try {
        if (!ENVIRONMENT.WHITELIST_ENABLED || !hasWhitelistRules()) {
            return next()
        }

        if (isEnabledList(ENVIRONMENT.WHITELIST_IPS)) {
            const requestIp = getRequestIp(request)
            const isAllowedIp = matchesIpRule(requestIp, ENVIRONMENT.WHITELIST_IPS)

            if (!isAllowedIp) {
                throw new ServerError('Access denied: IP is not whitelisted.', 403)
            }
        }

        if (isEnabledList(ENVIRONMENT.WHITELIST_ORIGINS)) {
            const requestOrigin = getRequestOrigin(request)
            if (requestOrigin && !matchesValueRule(requestOrigin, ENVIRONMENT.WHITELIST_ORIGINS)) {
                throw new ServerError('Access denied: origin is not whitelisted.', 403)
            }
        }

        return next()
    } catch (error) {
        return next(error)
    }
}

export default whitelistMiddleware
