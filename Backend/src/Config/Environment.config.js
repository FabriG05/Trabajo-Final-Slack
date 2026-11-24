import dotenv from 'dotenv'

/* Loads the variables defined in the .env file into process.env */
dotenv.config()

function parseBoolean(value, defaultValue = false) {
    if (value === undefined || value === null || value === '') return defaultValue
    return String(value).trim().toLowerCase() === 'true'
}

function parseCsvList(value) {
    if (typeof value !== 'string' || value.trim() === '') return []

    return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
}

function parsePositiveInt(value, defaultValue) {
    const parsedValue = Number.parseInt(value, 10)
    if (Number.isNaN(parsedValue) || parsedValue <= 0) return defaultValue
    return parsedValue
}

const ENVIRONMENT = {
    MONGO_URI: process.env.MONGO_URI,
    MONGO_DB_NAME: process.env.MONGO_DB_NAME,
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
    GMAIL_USER: process.env.GMAIL_USER,
    GMAIL_PASSWORD: process.env.GMAIL_PASSWORD,
    URL_BACKEND: process.env.URL_BACKEND,
    URL_FRONTEND: process.env.URL_FRONTEND,
    WHITELIST_ENABLED: parseBoolean(process.env.WHITELIST_ENABLED, false),
    WHITELIST_IPS: parseCsvList(process.env.WHITELIST_IPS),
    WHITELIST_ORIGINS: parseCsvList(process.env.WHITELIST_ORIGINS),
    WHITELIST_IDENTIFIERS: parseCsvList(process.env.WHITELIST_IDENTIFIERS),
    BLACKLIST_IPS: parseCsvList(process.env.BLACKLIST_IPS),
    BLACKLIST_IDENTIFIERS: parseCsvList(process.env.BLACKLIST_IDENTIFIERS),
    BLACKLIST_TOKENS: parseCsvList(process.env.BLACKLIST_TOKENS),
    RATE_LIMIT_WINDOW_MS: parsePositiveInt(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    RATE_LIMIT_MAX: parsePositiveInt(process.env.RATE_LIMIT_MAX, 100),
    AUTH_RATE_LIMIT_WINDOW_MS: parsePositiveInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    AUTH_RATE_LIMIT_MAX: parsePositiveInt(process.env.AUTH_RATE_LIMIT_MAX, 10)
}

export default ENVIRONMENT