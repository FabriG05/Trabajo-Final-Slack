import React from 'react'
import { IconDMs } from './SlackIcons'
import '../CSS/DmPlaceholderView.css'

function DmPlaceholderView() {
    return (
        <main className='dm-placeholder' aria-label='Direct messages'>
            <div className='dm-placeholder__content'>
                <div className='dm-placeholder__icon'>
                    <IconDMs size={28} />
                </div>
                <h2 className='dm-placeholder__title'>Start chatting privately</h2>
                <p className='dm-placeholder__text'>
                    Select a direct message from the sidebar to start a conversation.
                </p>
            </div>
        </main>
    )
}

export default DmPlaceholderView
