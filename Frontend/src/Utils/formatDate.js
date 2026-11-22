/*
    Date helpers shared by the conversation UI.

    The locale is pinned to en-US on purpose: the interface is English,
    so the labels must not follow the browser locale (which could render
    "viernes" instead of "Friday").
*/
const LOCALE = 'en-US'

function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function getDayDifference(date) {
    return Math.round((startOfDay(new Date()) - startOfDay(date)) / 86400000)
}

/*
    Stable key for a calendar day ("2026-11-22"), used to remember which
    date separators are collapsed. Returns null for an invalid date.
*/
export function getDayKey(value) {
    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return null
    }

    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${date.getFullYear()}-${month}-${day}`
}

/*
    Label of a conversation date separator: Today, Yesterday or
    "Sunday, November 15". Returns null for an invalid date.
*/
export function formatDayLabel(value) {
    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return null
    }

    const dayDifference = getDayDifference(date)

    if (dayDifference === 0) {
        return 'Today'
    }

    if (dayDifference === 1) {
        return 'Yesterday'
    }

    return date.toLocaleDateString(LOCALE, {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    })
}

/*
    Timestamp of the DMs list: time of day for today, "Yesterday" or
    the weekday for the last week, and a short date for older messages.
*/
export function formatConversationTimestamp(value) {
    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return ''
    }

    const dayDifference = getDayDifference(date)

    if (dayDifference === 0) {
        return date.toLocaleTimeString(LOCALE, {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (dayDifference === 1) {
        return 'Yesterday'
    }

    if (dayDifference > 1 && dayDifference < 7) {
        return date.toLocaleDateString(LOCALE, { weekday: 'long' })
    }

    return date.toLocaleDateString(LOCALE, {
        month: 'short',
        day: 'numeric'
    })
}
