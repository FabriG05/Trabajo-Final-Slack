import React from 'react'
import { Route, Routes } from 'react-router'
import AuthMiddleware from './Middlewares/AuthMiddleware'
import GuestMiddleware from './Middlewares/GuestMiddleware'
import PlaceholderScreen from './Screens/PlaceholderScreen/JSX/PlaceholderScreen'
import LandingScreen from './Screens/LandingScreen/JSX/LandingScreen'
import HomeScreeen from './Screens/HomeScreen/JSX/HomeScreen'
import CreateWorkspaceScreen from './Screens/CreateWorkspaceScreen/JSX/CreateWorkspaceScreen'
import LogInScreen from './Screens/LogInScreen/JSX/LogInScreen'
import RegisterScreen from './Screens/RegisterScreen/JSX/RegisterScreen'
import VerifyEmailScreen from './Screens/VerifyEmailScreen/JSX/VerifyEmailScreen'
import ResendEmailVerificationScreen from './Screens/ResendEmailVerificationScreen/JSX/ResendEmailVerificationScreen'
import ForgotPasswordScreen from './Screens/ForgotPasswordScreen/JSX/ForgotPasswordScreen'
import ResetPasswordScreen from './Screens/ResetPasswordScreen/JSX/ResetPasswordScreen'
import JoinWorkspaceScreen from './Screens/JoinWorkspaceScreen/JSX/JoinWorkspaceScreen'
import WorkspaceScreen from './Screens/WorkspaceScreen/JSX/WorkspaceScreen'

const App = () => {
  return (
    <Routes>
      <Route element={<GuestMiddleware />}>
        <Route path='/' element={<LandingScreen />} />
      </Route>
      <Route element={<AuthMiddleware />}>
        <Route path='/home' element={<HomeScreeen />} />
        <Route path='/create-workspace' element={<CreateWorkspaceScreen />} />
        <Route path='/workspace/:workspaceId' element={<WorkspaceScreen />} />
        <Route path='/workspace/:workspaceId/channels/:channelId' element={<WorkspaceScreen />} />
      </Route>
      <Route path='/login' element={<LogInScreen />} />
      <Route path='/register' element={<RegisterScreen />} />

      {/* Target of the workspace invitation links (copy link button and invitation emails). */}
      <Route path='/workspace/:workspaceId/join' element={<JoinWorkspaceScreen />} />
      <Route path='/verify-email' element={<VerifyEmailScreen />} />
      <Route path='/resend-email-verification' element={<ResendEmailVerificationScreen />} />
      <Route path='/forgot-password' element={<ForgotPasswordScreen />} />
      <Route path='/reset-password' element={<ResetPasswordScreen />} />
      <Route path='*' element={<PlaceholderScreen />} />
    </Routes>
  )
}

export default App
