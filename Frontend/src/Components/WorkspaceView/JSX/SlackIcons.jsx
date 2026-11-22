import React from 'react'

/*
    SlackIcons: vector SVGs extracted directly from Slack's design system.
    All icons use viewBox='0 0 20 20' (or 24) and fill='currentColor' so they
    adapt seamlessly to parent text colors, hover states, and sizes.
*/

export function IconHome({ size = 20, className = '' }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox='0 0 20 20'
            fill='currentColor'
            className={className}
            aria-hidden='true'
        >
            <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M10.979 1.776a1.75 1.75 0 0 0-1.957 0L1.83 6.629a.75.75 0 0 0 .84 1.243L3 7.649v7.011c0 2.071 1.679 3.84 3.75 3.84h6.5c2.071 0 3.75-1.769 3.75-3.84V7.65l.33.223a.75.75 0 0 0 .84-1.243zM11 11a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1z'
            />
        </svg>
    )
}

export function IconDMs({ size = 20, className = '' }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox='0 0 20 20'
            fill='currentColor'
            className={className}
            aria-hidden='true'
        >
            <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M12.25 3a4.75 4.75 0 0 1 4.35 6.662l-.118.247a.75.75 0 0 0-.067.489l.378 1.896-1.895-.379a.75.75 0 0 0-.372.02l-.117.047a5 5 0 0 1-.648.273.75.75 0 1 0 .478 1.422 6 6 0 0 0 .61-.242l2.754.55a.75.75 0 0 0 .883-.883l-.553-2.755A6.25 6.25 0 1 0 6.23 6.064a.75.75 0 0 0 1.445.404A4.75 4.75 0 0 1 12.25 3M6.5 10a3.5 3.5 0 1 1-1.59 6.618.75.75 0 0 0-.364-.08l-.125.013-1.215.242.243-1.214a.75.75 0 0 0-.067-.488A3.5 3.5 0 0 1 6.5 10m0 8.5a5 5 0 1 0-4.57-2.97l-.415 2.073a.75.75 0 0 0 .882.882l2.073-.415c.62.277 1.308.43 2.03.43'
            />
        </svg>
    )
}

export function IconActivity({ size = 20, className = '' }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox='0 0 20 20'
            fill='currentColor'
            className={className}
            aria-hidden='true'
        >
            <path
                d='M10 1.5c.688 0 1.31.246 1.767.762.33.374.538.85.65 1.384 1.21.368 2.104 1.136 2.687 2.356.604 1.266.854 2.988.89 5.182l1.868 1.878.013.011.01.013c.637.7.807 1.59.374 2.342-.407.704-1.224 1.072-2.105 1.072h-3.383c-.128.39-.336.775-.638 1.105-.493.537-1.208.895-2.12.895-.917 0-1.638-.356-2.136-.893a3 3 0 0 1-.646-1.107H3.843c-.88 0-1.697-.368-2.104-1.072-.433-.752-.263-1.643.372-2.342l.012-.013.013-.013.531.53.005.005-.536-.535 1.87-1.876c.036-2.194.288-3.916.891-5.182.582-1.22 1.476-1.988 2.685-2.356.112-.534.32-1.01.651-1.384C8.69 1.746 9.312 1.5 10 1.5M10 3c-.311 0-.505.1-.644.256-.156.177-.308.504-.359 1.062l-.05.558-.55.11c-1.023.204-1.69.71-2.145 1.661-.485 1.017-.736 2.567-.752 4.858l-.002.307-.217.217-2.068 2.075c-.147.164-.195.295-.208.377a.3.3 0 0 0 .034.198c.07.12.304.32.804.321h4.665l.07.672c.033.327.17.668.4.916.214.231.536.412 1.036.412.486 0 .802-.178 1.013-.41.227-.247.362-.588.396-.916l.07-.674h4.661c.5 0 .736-.202.805-.321a.3.3 0 0 0 .034-.199c-.013-.082-.063-.215-.214-.381l-2.06-2.07-.217-.217-.002-.307c-.015-2.29-.266-3.841-.751-4.858-.454-.952-1.122-1.457-2.147-1.662l-.548-.109-.051-.558c-.051-.558-.203-.885-.36-1.062C10.506 3.099 10.312 3 10 3'
            />
        </svg>
    )
}

export function IconFiles({ size = 20, className = '' }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox='0 0 20 20'
            fill='currentColor'
            className={className}
            aria-hidden='true'
        >
            <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M12.164 1.5a3.337 3.337 0 0 1 3.32 3.015 3.337 3.337 0 0 1 3.016 3.32v3.97a2.75 2.75 0 0 1-.806 1.944l-3.945 3.945a2.75 2.75 0 0 1-1.944.806h-3.97a3.337 3.337 0 0 1-3.32-3.015 3.337 3.337 0 0 1-3.015-3.32v-7.33A3.336 3.336 0 0 1 4.836 1.5zm0 1.5c.9 0 1.647.647 1.805 1.5H7.836A3.336 3.336 0 0 0 4.5 7.836v6.133A1.84 1.84 0 0 1 3 12.164V4.836C3 3.822 3.822 3 4.836 3zM17 11.5V7.836A1.836 1.836 0 0 0 15.164 6H7.836A1.836 1.836 0 0 0 6 7.836v7.328C6 16.178 6.822 17 7.836 17H11.5v-4a1.5 1.5 0 0 1 1.5-1.5zm-.678 1.5H13v3.322z'
            />
        </svg>
    )
}

export function IconAgents({ size = 20, className = '' }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox='0 0 20 20'
            fill='currentColor'
            className={className}
            aria-hidden='true'
        >
            <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M14.548 1.686a.332.332 0 0 0-.596 0l-.86 1.714-.103.189c-.258.43-.639.774-1.088 1l-1.716.861-.08.054a.333.333 0 0 0 .08.54l1.716.861.19.103c.43.258.774.638 1 1.087l.861 1.715a.332.332 0 0 0 .596 0l.86-1.715c.254-.518.678-.93 1.19-1.19l1.317-.66.25-.498v.001l-.248.495.397-.198a.33.33 0 0 0 .081-.54l-.08-.055-1.716-.86a2.65 2.65 0 0 1-1.19-1.19zm-1.649 4.06a4.14 4.14 0 0 0 1.352-1.35A4.14 4.14 0 0 0 15.6 5.748a4.15 4.15 0 0 0-1.352 1.35 4.14 4.14 0 0 0-1.349-1.352M4.875 4a1.875 1.875 0 1 1 0 3.75 1.875 1.875 0 0 1 0-3.75m0 5.25a3.375 3.375 0 1 0 0-6.75 3.375 3.375 0 0 0 0 6.75m1.875 5.875a1.875 1.875 0 1 0-3.75 0 1.875 1.875 0 0 0 3.75 0m1.5 0a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0m6.125-1.875a1.875 1.875 0 1 1 0 3.75 1.875 1.875 0 0 1 0-3.75m0 5.25a3.375 3.375 0 1 0 0-6.75 3.375 3.375 0 0 0 0 6.75'
            />
        </svg>
    )
}

export function IconAdmin({ size = 20, className = '' }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox='0 0 20 20'
            fill='currentColor'
            className={className}
            aria-hidden='true'
        >
            <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M11.486 1.286a4 4 0 0 0-2.972 0 .75.75 0 0 0-.45.519l-.372 1.522-.004.019a.5.5 0 0 1-.758.313l-.016-.01-1.34-.813a.75.75 0 0 0-.685-.048 4 4 0 0 0-2.1 2.1.75.75 0 0 0 .047.685l.814 1.341.01.016a.5.5 0 0 1-.314.758l-.007.001-.011.002-1.523.373a.75.75 0 0 0-.518.45 4 4 0 0 0 0 2.971.75.75 0 0 0 .518.45l1.523.373.018.004a.5.5 0 0 1 .345.702l-.031.056-.01.016-.814 1.34a.75.75 0 0 0-.078.6l.03.084.08.175a4 4 0 0 0 2.021 1.927.75.75 0 0 0 .685-.049l1.34-.813.016-.01a.5.5 0 0 1 .758.314l.004.018.373 1.523.026.086a.75.75 0 0 0 .423.432 4 4 0 0 0 2.972 0 .75.75 0 0 0 .423-.432l.027-.086.372-1.523.004-.018a.5.5 0 0 1 .702-.345l.057.03.015.01 1.34.814a.75.75 0 0 0 .6.08l.085-.031a4 4 0 0 0 2.021-1.927l.08-.175a.75.75 0 0 0-.049-.684l-.813-1.34-.01-.016-.031-.056a.5.5 0 0 1 .346-.702l.017-.004 1.524-.373a.75.75 0 0 0 .517-.45 4 4 0 0 0 0-2.971.75.75 0 0 0-.431-.423l-.086-.027-1.524-.373-.017-.003a.5.5 0 0 1-.315-.758l.01-.016.813-1.34a.75.75 0 0 0 .05-.685 4 4 0 0 0-1.928-2.02l-.174-.08-.085-.032a.75.75 0 0 0-.6.079l-1.34.813-.015.01a.5.5 0 0 1-.76-.32l-.003-.012-.372-1.522a.75.75 0 0 0-.45-.519m.822 2.041-.729.179-.02.004zm4.347 4.36-.15.685-.01.043zm0 4.625-.162-.733h.002zm-4.347 4.36-.729-.179.019.004zm-4.62-.018.727-.16-.014.004zm-4.36-4.346.182-.748-.004.02zM9.42 2.57c.381-.09.777-.09 1.159 0l.272 1.114a1.998 1.998 0 0 0 3.013 1.247l.98-.594c.333.205.612.485.818.818l-.585.965a2 2 0 0 0 1.256 3.032l1.095.268c.091.381.09.777 0 1.158l-1.112.273a2 2 0 0 0-1.248 3.012l.595.98a2.5 2.5 0 0 1-.82.818l-.978-.594h-.001a2 2 0 0 0-3.013 1.248l-.273 1.113c-.38.09-.777.09-1.158 0l-.267-1.095a2 2 0 0 0-3.017-1.266l-.98.594a2.5 2.5 0 0 1-.819-.818l.595-.979h-.001a1.998 1.998 0 0 0-1.248-3.013h.001l-1.113-.273a2.5 2.5 0 0 1 0-1.158l1.094-.268.001.001A2 2 0 0 0 4.99 6.23l-.067-.11-.585-.964a2.5 2.5 0 0 1 .82-.82l.98.596V4.93c1.17.736 2.72.089 3.016-1.266zM10 8a2 2 0 1 1 0 4 2 2 0 0 1 0-4m0 5.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7'
            />
        </svg>
    )
}

export function IconMoon({ size = 20, className = '' }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox='0 0 20 20'
            fill='currentColor'
            className={className}
            aria-hidden='true'
        >
            <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M2 9.994a7.97 7.97 0 0 1 7.302-7.97l.4-.023a.65.65 0 0 1 .64.405c.113.26.04.563-.158.75a5.58 5.58 0 0 0-1.845 4.17 5.68 5.68 0 0 0 5.672 5.671q1.234 0 2.378-.532a.669.669 0 0 1 .885.886A8.03 8.03 0 0 1 10.005 18C5.598 18 2 14.404 2 9.994m4.839-2.668c0-1.22.305-2.387.872-3.42A6.47 6.47 0 0 0 3.5 9.993c0 3.582 2.926 6.506 6.506 6.506 1.81 0 3.517-.763 4.727-2.041a7.18 7.18 0 0 1-7.895-7.133'
            />
        </svg>
    )
}

export function IconCompose({ size = 18, className = '' }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox='0 0 20 20'
            fill='currentColor'
            className={className}
            aria-hidden='true'
        >
            <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M14.232 2.207a2.5 2.5 0 0 1 3.536 0l.025.026a2.5 2.5 0 0 1 0 3.535L11.03 12.53a.75.75 0 0 1-.361.2l-3.25.75a.75.75 0 0 1-.9-.9l.75-3.25.03-.1a.75.75 0 0 1 .17-.261zm2.475 1.06a1 1 0 0 0-1.414 0l-.482.483 1.439 1.44.482-.483a1 1 0 0 0 0-1.414zM15.189 6.25l-1.44-1.44-5.067 5.068-.432 1.871 1.871-.431zM1.5 14.75v-8.5A3.75 3.75 0 0 1 5.25 2.5h4.5a.75.75 0 0 1 0 1.5h-4.5A2.25 2.25 0 0 0 3 6.25v8.5A2.25 2.25 0 0 0 5.25 17h8.5A2.25 2.25 0 0 0 16 14.75v-4.5a.75.75 0 0 1 1.5 0v4.5a3.75 3.75 0 0 1-3.75 3.75h-8.5a3.75 3.75 0 0 1-3.75-3.75'
            />
        </svg>
    )
}

export function IconDirectories({ size = 16, className = '' }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox='0 0 20 20'
            fill='currentColor'
            className={className}
            aria-hidden='true'
        >
            <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M3 3.25v.5a.75.75 0 0 0 1.5 0v-.5A.25.25 0 0 1 4.75 3h10c.69 0 1.25.56 1.25 1.25v11.5c0 .69-.56 1.25-1.25 1.25h-10a.25.25 0 0 1-.25-.25v-.5a.75.75 0 0 0-1.5 0v.5c0 .966.784 1.75 1.75 1.75h10a2.75 2.75 0 0 0 2.75-2.75V4.25a2.75 2.75 0 0 0-2.75-2.75h-10A1.75 1.75 0 0 0 3 3.25m2 3.5A.75.75 0 0 0 4.25 6h-2a.75.75 0 0 0 0 1.5h2A.75.75 0 0 0 5 6.75m-.75 2.5a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5zm.75 4a.75.75 0 0 0-.75-.75h-2a.75.75 0 0 0 0 1.5h2a.75.75 0 0 0 .75-.75m7.16-2.98q.53.192.948.5a3.6 3.6 0 0 1 1.284 1.754c.187.544.032 1.07-.293 1.432a1.68 1.68 0 0 1-1.249.544h-4.7c-.478 0-.938-.197-1.25-.544a1.42 1.42 0 0 1-.292-1.432A3.61 3.61 0 0 1 8.84 10.27a3 3 0 0 1-.219-.268A3.5 3.5 0 0 1 8 8c0-1.624 1.287-2.5 2.5-2.5S13 6.376 13 8c0 .712-.217 1.437-.622 2.002a3 3 0 0 1-.219.268M10.5 11.5c-.805 0-1.353.21-1.724.481a2.1 2.1 0 0 0-.735.989l.007.005.012.007q.038.017.09.018h4.7a.2.2 0 0 0 .09-.018l.011-.007.006-.005a2.1 2.1 0 0 0-.733-.989c-.371-.27-.92-.481-1.725-.481m0-4.5c.537 0 1 .35 1 1 0 .426-.134.839-.34 1.127-.203.282-.434.398-.66.398s-.457-.116-.66-.398A2 2 0 0 1 9.5 8c0-.65.463-1 1-1'
            />
        </svg>
    )
}

export function IconSectionCollapse({ size = 12, className = '' }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox='0 0 20 20'
            fill='currentColor'
            className={className}
            aria-hidden='true'
        >
            <path d='M13.22 9.423a.75.75 0 0 1 .001 1.151l-4.49 3.755a.75.75 0 0 1-1.231-.575V6.25a.75.75 0 0 1 1.23-.575z' />
        </svg>
    )
}

export function IconSearch({ size = 16, className = '' }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox='0 0 20 20'
            fill='currentColor'
            className={className}
            aria-hidden='true'
        >
            <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M8.5 3a5.5 5.5 0 1 0 3.39 9.835l3.637 3.637a.75.75 0 0 0 1.06-1.06l-3.636-3.638A5.5 5.5 0 0 0 8.5 3M4.5 8.5a4 4 0 1 1 8 0 4 4 0 0 1-8 0'
            />
        </svg>
    )
}

export function IconHistory({ size = 16, className = '' }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox='0 0 20 20'
            fill='currentColor'
            className={className}
            aria-hidden='true'
        >
            <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M10 2a8 8 0 1 0 7.9 9.25.75.75 0 0 0-1.48-.25A6.5 6.5 0 1 1 10 3.5c1.47 0 2.83.49 3.92 1.32L12.44 6.3a.75.75 0 0 0 .53 1.28H16.5a.75.75 0 0 0 .75-.75V3.25a.75.75 0 0 0-1.28-.53l-1.1 1.1A7.95 7.95 0 0 0 10 2m.75 4.5a.75.75 0 0 0-1.5 0v4.25c0 .41.34.75.75.75h3.25a.75.75 0 0 0 0-1.5H10.75z'
            />
        </svg>
    )
}

export function IconStar({ size = 16, className = '', filled = false }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox='0 0 20 20'
            fill={filled ? 'currentColor' : 'none'}
            stroke='currentColor'
            strokeWidth='1.5'
            className={className}
            aria-hidden='true'
        >
            <path
                strokeLinejoin='round'
                d='m10 2.5 2.47 5.01 5.53.8-4 3.9 1 5.5-5-2.63-5 2.63 1-5.5-4-3.9 5.53-.8z'
            />
        </svg>
    )
}

export function IconHuddle({ size = 16, className = '' }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox='0 0 20 20'
            fill='currentColor'
            className={className}
            aria-hidden='true'
        >
            <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M10 3a7 7 0 0 0-7 7v4.5A2.5 2.5 0 0 0 5.5 17H6a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H4.5v-.5a5.5 5.5 0 1 1 11 0v.5H14a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h.5a2.5 2.5 0 0 0 2.5-2.5V10a7 7 0 0 0-7-7'
            />
        </svg>
    )
}

export function IconMembers({ size = 16, className = '' }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox='0 0 20 20'
            fill='currentColor'
            className={className}
            aria-hidden='true'
        >
            <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M7.5 7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5m5.5 1a2 2 0 1 0 0-4 2 2 0 0 0 0 4M2.75 14.5a3.75 3.75 0 0 1 7.5 0 .75.75 0 0 1-.75.75h-6a.75.75 0 0 1-.75-.75m8.75.75a.75.75 0 0 0 .75-.75 3 3 0 0 0-2.09-2.86.75.75 0 1 0-.47 1.42 1.5 1.5 0 0 1 1.06 1.44c0 .41.34.75.75.75'
            />
        </svg>
    )
}

export function IconMore({ size = 16, className = '' }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox='0 0 20 20'
            fill='currentColor'
            className={className}
            aria-hidden='true'
        >
            <circle cx='4' cy='10' r='1.75' />
            <circle cx='10' cy='10' r='1.75' />
            <circle cx='16' cy='10' r='1.75' />
        </svg>
    )
}

export function IconSend({ size = 16, className = '' }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox='0 0 20 20'
            fill='currentColor'
            className={className}
            aria-hidden='true'
        >
            <path d='m2.5 3.25 15 6.75-15 6.75 2.25-6.75z' />
        </svg>
    )
}

export function IconRocket({ size = 18, className = '' }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox='0 0 20 20'
            fill='currentColor'
            className={className}
            aria-hidden='true'
        >
            <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M11.5 2a6.5 6.5 0 0 1 6.5 6.5c0 1.25-.43 2.5-1.13 3.48l-.05.07-2.92-2.92a.75.75 0 0 0-1.06 1.06l2.92 2.92-.07.05a6.5 6.5 0 0 1-3.48 1.13H11v1.5a.75.75 0 0 1-1.28.53l-2.5-2.5a.75.75 0 0 1 0-1.06l2.5-2.5a.75.75 0 0 1 1.28.53V13h.25a5 5 0 0 0 3.32-1.28l-5.74-5.74A5 5 0 0 0 9 9.25V9.5H7.72a.75.75 0 0 1-.53-1.28l2.5-2.5a.75.75 0 0 1 1.06 0l2.5 2.5a.75.75 0 0 1-.53 1.28H10.5V9a6.5 6.5 0 0 1 1-3.6z'
            />
        </svg>
    )
}

export function IconSparkle({ size = 16, className = '' }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox='0 0 20 20'
            fill='currentColor'
            className={className}
            aria-hidden='true'
        >
            <path d='M10 2.5a.75.75 0 0 1 .74.63l.36 2.52a4.5 4.5 0 0 0 3.25 3.25l2.52.36a.75.75 0 0 1 0 1.48l-2.52.36a4.5 4.5 0 0 0-3.25 3.25l-.36 2.52a.75.75 0 0 1-1.48 0l-.36-2.52a4.5 4.5 0 0 0-3.25-3.25l-2.52-.36a.75.75 0 0 1 0-1.48l2.52-.36a4.5 4.5 0 0 0 3.25-3.25l.36-2.52A.75.75 0 0 1 10 2.5' />
        </svg>
    )
}

export function IconUser({ size = 16, className = '' }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox='0 0 20 20'
            fill='currentColor'
            className={className}
            aria-hidden='true'
        >
            <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M10 9a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m-5.5 6.5a5.5 5.5 0 0 1 11 0 .75.75 0 0 1-.75.75h-9.5a.75.75 0 0 1-.75-.75'
            />
        </svg>
    )
}

export function IconSettingsSliders({ size = 16, className = '' }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox='0 0 20 20'
            fill='currentColor'
            className={className}
            aria-hidden='true'
        >
            <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M3 5.25a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 0 1.5h-3.5A.75.75 0 0 1 3 5.25m8 0a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75M3 10a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 3 10m12 0a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 15 10M3 14.75a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75m6 0a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1-.75-.75'
            />
        </svg>
    )
}

export function IconChevronDown({ size = 12, className = '' }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox='0 0 20 20'
            fill='currentColor'
            className={className}
            aria-hidden='true'
        >
            <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06'
            />
        </svg>
    )
}

export function IconSprout({ size = 16, className = '' }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox='0 0 20 20'
            fill='currentColor'
            className={className}
            aria-hidden='true'
        >
            <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M10 18a.75.75 0 0 1-.75-.75V11c0-2.48-2.02-4.5-4.5-4.5H4a.75.75 0 0 1-.75-.75C3.25 3.02 5.27 1 7.75 1 10.96 1 13 3.5 13 6.5v.75h1.75c2.48 0 4.5 2.02 4.5 4.5a.75.75 0 0 1-.75.75h-.75c-2.48 0-4.5-2.02-4.5-4.5V6.75A5.6 5.6 0 0 0 10.75 9v8.25c0 .41-.34.75-.75.75'
            />
        </svg>
    )
}

export function IconExternalLink({ size = 12, className = '' }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox='0 0 20 20'
            fill='currentColor'
            className={className}
            aria-hidden='true'
        >
            <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M12.25 3.5a.75.75 0 0 0 0 1.5h2.44l-6.72 6.72a.75.75 0 1 0 1.06 1.06l6.72-6.72v2.44a.75.75 0 0 0 1.5 0v-4.25a.75.75 0 0 0-.75-.75zm-7 2A2.75 2.75 0 0 0 2.5 8.25v6.5A2.75 2.75 0 0 0 5.25 17.5h6.5A2.75 2.75 0 0 0 14.5 14.75v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25h-6.5c-.69 0-1.25-.56-1.25-1.25v-6.5c0-.69.56-1.25 1.25-1.25h2.5a.75.75 0 0 0 0-1.5z'
            />
        </svg>
    )
}

export function IconCheck({ size = 16, className = '' }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox='0 0 20 20'
            fill='currentColor'
            className={className}
            aria-hidden='true'
        >
            <path d='M8.2 13.3 4.9 10l-1.3 1.3 4.6 4.6 8.2-8.2-1.3-1.3z' />
        </svg>
    )
}

export function IconBell({ size = 16, className = '' }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox='0 0 20 20'
            fill='currentColor'
            className={className}
            aria-hidden='true'
        >
            <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M10 2a4 4 0 0 0-4 4v2.59l-.97.97A1.75 1.75 0 0 0 4.5 10.8V13c0 .41.34.75.75.75h9.5a.75.75 0 0 0 .75-.75v-2.2a1.75 1.75 0 0 0-.53-1.24l-.97-.97V6a4 4 0 0 0-4-4m-1.5 13.5a1.5 1.5 0 0 0 3 0z'
            />
        </svg>
    )
}

export function IconHelp({ size = 16, className = '' }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox='0 0 20 20'
            fill='currentColor'
            className={className}
            aria-hidden='true'
        >
            <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16m0 11.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2m.25-8.25a2.75 2.75 0 0 0-2.6 1.84.75.75 0 0 0 1.42.5 1.25 1.25 0 1 1 2.18 1.16.75.75 0 0 0-.25.55v1.2a.75.75 0 0 0 1.5 0v-.76a2.75 2.75 0 0 0-2.25-4.49'
            />
        </svg>
    )
}

export function IconTrash({ size = 16, className = '' }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox='0 0 20 20'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
            className={className}
            aria-hidden='true'
        >
            <path d='M3.5 5.5h13' />
            <path d='M7.5 5.5V3.75h5V5.5' />
            <path d='M5.25 5.5l.66 10.05a1 1 0 0 0 1 .95h6.18a1 1 0 0 0 1-.95l.66-10.05' />
            <path d='M8.25 8.5v5' />
            <path d='M11.75 8.5v5' />
        </svg>
    )
}
