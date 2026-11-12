/*
    Turns a link label into a deterministic route slug, so any
    placeholder navigation (navbar dropdowns, footer) lands on
    the router's fallback screen until the real page exists.

    Examples: 'Apps & integrations' -> 'apps-and-integrations',
    "What's new" -> 'what-s-new', 'Watch demo' -> 'watch-demo'.
*/
function slugify(label) {
    return label
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

export default slugify
