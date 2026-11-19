import '../CSS/WorkspacePreview.css'

/*
    Decorative mockup of the workspace UI shown on the right side
    of the onboarding card. It updates live: the workspace name in
    step 1, the user name and photo in step 2 and the invited
    teammate in step 3. Where the photo is missing, the initial
    is shown as a fallback.
*/
function WorkspacePreview({ workspaceName, userName, userPhoto, teammateName }) {
    const safeWorkspaceName = workspaceName.trim() || 'New Workspace'
    const safeUserName = userName.trim() || 'Your name'
    const safeTeammateName = teammateName.trim() || 'Your teammate'

    return (
        <div className='workspace-preview' aria-hidden='true'>
            {/* Left rail with the main navigation icons */}
            <div className='workspace-preview__rail'>
                <div className='workspace-preview__workspace-tile'>
                    {safeWorkspaceName.charAt(0).toUpperCase()}
                </div>

                <div className='workspace-preview__rail-item'>
                    <svg viewBox='0 0 24 24' className='workspace-preview__icon'>
                        <path d='M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1v-9.5Z' />
                    </svg>
                    <span className='workspace-preview__rail-label'>Home</span>
                </div>

                <div className='workspace-preview__rail-item'>
                    <svg viewBox='0 0 24 24' className='workspace-preview__icon'>
                        <path d='M4 6a1 1 0 0 1 1-1h5l2 2h7a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6Z' />
                    </svg>
                    <span className='workspace-preview__rail-label'>Files</span>
                </div>

                <div className='workspace-preview__rail-item'>
                    <svg viewBox='0 0 24 24' className='workspace-preview__icon'>
                        <path d='M12 2a5 5 0 0 0-4.6 3.03L4 8.4v7.2l3.4 3.37A5 5 0 0 0 12 22a5 5 0 0 0 4.6-3.03L20 15.6V8.4l-3.4-3.37A5 5 0 0 0 12 2Zm0 6a1 1 0 0 1 1 1v2h2a1 1 0 1 1 0 2h-2v2a1 1 0 1 1-2 0v-2H9a1 1 0 1 1 0-2h2V9a1 1 0 0 1 1-1Z' />
                    </svg>
                    <span className='workspace-preview__rail-label'>Tools</span>
                </div>

                <span className='workspace-preview__rail-dots'>&bull;&bull;&bull;</span>

                <div className='workspace-preview__rail-plus'>+</div>

                <div className='workspace-preview__rail-avatar'>
                    {userPhoto ? (
                        <img
                            className='workspace-preview__avatar-image'
                            src={userPhoto}
                            alt=''
                        />
                    ) : (
                        safeUserName.charAt(0).toUpperCase()
                    )}
                    <span className='workspace-preview__presence' />
                </div>
            </div>

            {/* Channel sidebar */}
            <div className='workspace-preview__sidebar'>
                <h4 className='workspace-preview__workspace-name'>
                    {safeWorkspaceName}
                </h4>

                <ul className='workspace-preview__list'>
                    <li className='workspace-preview__item'>
                        <span className='workspace-preview__glyph'>&#9776;</span>
                        Unread messages
                    </li>
                    <li className='workspace-preview__item'>
                        <span className='workspace-preview__glyph'>&#9993;</span>
                        Threads
                    </li>
                </ul>

                <p className='workspace-preview__section-title'>
                    <span className='workspace-preview__caret'>&#9662;</span>
                    Channels
                </p>
                <ul className='workspace-preview__list'>
                    <li className='workspace-preview__item'>
                        <span className='workspace-preview__glyph'>#</span>
                        project
                    </li>
                    <li className='workspace-preview__item workspace-preview__item--action'>
                        <span className='workspace-preview__glyph'>+</span>
                        Add channels
                    </li>
                </ul>

                <p className='workspace-preview__section-title'>
                    <span className='workspace-preview__caret'>&#9662;</span>
                    Direct messages
                </p>
                <ul className='workspace-preview__list'>
                    <li className='workspace-preview__item'>
                        <span className='workspace-preview__dm-avatar'>
                            {userPhoto ? (
                                <img
                                    className='workspace-preview__avatar-image'
                                    src={userPhoto}
                                    alt=''
                                />
                            ) : (
                                safeUserName.charAt(0).toUpperCase()
                            )}
                            <span className='workspace-preview__presence' />
                        </span>
                        {safeUserName}
                        <span className='workspace-preview__you'>you</span>
                    </li>
                    <li className='workspace-preview__item'>
                        <span className='workspace-preview__dm-avatar workspace-preview__dm-avatar--pending'>
                            {safeTeammateName.charAt(0).toUpperCase()}
                        </span>
                        {safeTeammateName}
                    </li>
                    <li className='workspace-preview__item workspace-preview__item--action'>
                        <span className='workspace-preview__glyph'>+</span>
                        Add teammates
                    </li>
                </ul>
            </div>

            {/* Main conversation panel */}
            <div className='workspace-preview__main'>
                <div className='workspace-preview__main-header'>
                    <span className='workspace-preview__channel-name'>
                        <span className='workspace-preview__glyph'>#</span>
                        project
                    </span>
                    <span className='workspace-preview__tab'>
                        <span className='workspace-preview__tab-dot' />
                        Messages
                    </span>
                </div>

                <div className='workspace-preview__message-box'>
                    <span>Message #project</span>
                    <span className='workspace-preview__message-tools'>+ Aa</span>
                </div>
            </div>
        </div>
    )
}

export default WorkspacePreview
