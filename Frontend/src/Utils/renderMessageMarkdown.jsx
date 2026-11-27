import React from 'react'

function isSafeHref(href) {
    try {
        const url = new URL(href)
        return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
        return false
    }
}

function renderInline(text, keyPrefix) {
    const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|~~[^~]+~~|`[^`]+`|\[[^\]]+\]\((https?:\/\/[^\s)]+)\))/g
    const nodes = []
    let lastIndex = 0
    let match
    let index = 0

    while ((match = pattern.exec(text)) !== null) {
        if (match.index > lastIndex) {
            nodes.push(text.slice(lastIndex, match.index))
        }

        const token = match[0]
        const key = `${keyPrefix}-${index++}`

        if (token.startsWith('**') && token.endsWith('**')) {
            nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>)
        } else if (token.startsWith('*') && token.endsWith('*')) {
            nodes.push(<em key={key}>{token.slice(1, -1)}</em>)
        } else if (token.startsWith('~~') && token.endsWith('~~')) {
            nodes.push(<del key={key}>{token.slice(2, -2)}</del>)
        } else if (token.startsWith('`') && token.endsWith('`')) {
            nodes.push(<code key={key}>{token.slice(1, -1)}</code>)
        } else if (token.startsWith('[')) {
            const linkMatch = token.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/)
            if (linkMatch && isSafeHref(linkMatch[2])) {
                nodes.push(
                    <a key={key} href={linkMatch[2]} target='_blank' rel='noreferrer'>
                        {linkMatch[1]}
                    </a>
                )
            } else {
                nodes.push(token)
            }
        } else {
            nodes.push(token)
        }

        lastIndex = pattern.lastIndex
    }

    if (lastIndex < text.length) {
        nodes.push(text.slice(lastIndex))
    }

    return nodes.length > 0 ? nodes : [text]
}

export function renderMessageMarkdown(text) {
    if (typeof text !== 'string' || text.length === 0) {
        return null
    }

    const lines = text.split('\n')
    return lines.map((line, lineIndex) => (
        <React.Fragment key={`line-${lineIndex}`}>
            {renderInline(line, `line-${lineIndex}`)}
            {lineIndex < lines.length - 1 && <br />}
        </React.Fragment>
    ))
}
