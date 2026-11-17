import { useState } from 'react'
import { useNavigate } from 'react-router'
import OnboardingProgress from '../../../Components/Onboarding/JSX/OnboardingProgress'
import WorkspacePreview from '../../../Components/Onboarding/JSX/WorkspacePreview'
import StepNameWorkspace from '../../../Components/Onboarding/JSX/StepNameWorkspace'
import StepProfile from '../../../Components/Onboarding/JSX/StepProfile'
import StepInvite from '../../../Components/Onboarding/JSX/StepInvite'
import useCreateWorkspace from '../../../Hooks/useCreateWorkspace'
import useUpdateProfile from '../../../Hooks/useUpdateProfile'
import useInviteMembers from '../../../Hooks/useInviteMembers'
import '../CSS/CreateWorkspaceScreen.css'

/*
    Three-step onboarding wizard to create a workspace:

    1. Name the workspace  -> the workspace is created through the API.
    2. User name + photo   -> the profile is updated through the API.
    3. Invite teammates    -> invitations are sent through the API.

    The live preview on the right mirrors what the user types.
*/
function CreateWorkspaceScreen() {
    const navigate = useNavigate()
    const {
        create_loading,
        create_error,
        submitCreateWorkspace
    } = useCreateWorkspace()
    const {
        profile_loading,
        profile_error,
        submitUpdateProfile
    } = useUpdateProfile()
    const {
        invitations_loading,
        invitations_error,
        submitInviteMembers
    } = useInviteMembers()

    const [step, setStep] = useState(1)
    const [workspaceName, setWorkspaceName] = useState('')
    const [workspaceId, setWorkspaceId] = useState(null)
    const [profileName, setProfileName] = useState('')
    const [profilePhoto, setProfilePhoto] = useState(null)
    const [inviteEmails, setInviteEmails] = useState('')

    // The first invited email feeds the "teammate" row of the preview.
    const previewTeammate = inviteEmails.split(/[,;\s]+/)[0] || ''

    async function handleNameSubmit() {
        const response = await submitCreateWorkspace(workspaceName.trim(), '')

        if (response) {
            setWorkspaceId(response.data.createdWorkspace._id)
            setStep(2)
        }
    }

    async function handleProfileSubmit() {
        const response = await submitUpdateProfile(profileName.trim(), profilePhoto)

        if (response) {
            setStep(3)
        }
    }

    async function handleInviteSubmit(emails) {
        const response = await submitInviteMembers(workspaceId, emails)

        if (response) {
            navigate('/home')
        }
    }

    function handleWorkspaceNameChange(event) {
        setWorkspaceName(event.target.value)
    }

    function handleProfileNameChange(event) {
        setProfileName(event.target.value)
    }

    function handleInviteEmailsChange(event) {
        setInviteEmails(event.target.value)
    }

    return (
        <div className='create-workspace-screen'>
            <div className='create-workspace-card'>
                <div className='create-workspace-card__content'>
                    <OnboardingProgress currentStep={step} />

                    {step === 1 && (
                        <StepNameWorkspace
                            value={workspaceName}
                            onChange={handleWorkspaceNameChange}
                            submitting={create_loading}
                            error={create_error}
                            onSubmit={handleNameSubmit}
                        />
                    )}

                    {step === 2 && (
                        <StepProfile
                            name={profileName}
                            photo={profilePhoto}
                            onNameChange={handleProfileNameChange}
                            onPhotoChange={setProfilePhoto}
                            submitting={profile_loading}
                            error={profile_error}
                            onSubmit={handleProfileSubmit}
                        />
                    )}

                    {step === 3 && (
                        <StepInvite
                            value={inviteEmails}
                            onChange={handleInviteEmailsChange}
                            workspaceId={workspaceId}
                            submitting={invitations_loading}
                            error={invitations_error}
                            onSubmit={handleInviteSubmit}
                        />
                    )}
                </div>

                <div className='create-workspace-card__preview'>
                    <WorkspacePreview
                        workspaceName={workspaceName}
                        userName={profileName}
                        teammateName={previewTeammate}
                    />
                </div>
            </div>
        </div>
    )
}

export default CreateWorkspaceScreen
