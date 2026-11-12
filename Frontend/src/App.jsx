import React from 'react'
import { Route, Routes } from 'react-router'
import AuthMiddleware from './Middlewares/AuthMiddleware'
import GuestMiddleware from './Middlewares/GuestMiddleware'
import PlaceholderScreen from './Screens/PlaceholderScreen/JSX/PlaceholderScreen'
import LandingScreen from './Screens/LandingScreen/JSX/LandingScreen'
import HomeScreeen from './Screens/HomeScreen/JSX/HomeScreen'
import LogInScreen from './Screens/LogInScreen/JSX/LogInScreen'
import RegisterScreen from './Screens/RegisterScreen/JSX/RegisterScreen'
import VerifyEmailScreen from './Screens/VerifyEmailScreen/JSX/VerifyEmailScreen'
import ResendEmailVerificationScreen from './Screens/ResendEmailVerificationScreen/JSX/ResendEmailVerificationScreen'
import ForgotPasswordScreen from './Screens/ForgotPasswordScreen/JSX/ForgotPasswordScreen'
import ResetPasswordScreen from './Screens/ResetPasswordScreen/JSX/ResetPasswordScreen'

const App = () => {
  return (
    <Routes>
      <Route element={<GuestMiddleware />}>
        <Route path='/' element={<LandingScreen />} />
      </Route>
      <Route element={<AuthMiddleware />}>
        <Route path='/home' element={<HomeScreeen />} />
      </Route>
      <Route path='/login' element={<LogInScreen />} />
      <Route path='/register' element={<RegisterScreen />} />
      <Route path='/verify-email' element={<VerifyEmailScreen />} />
      <Route path='/resend-email-verification' element={<ResendEmailVerificationScreen />} />
      <Route path='/forgot-password' element={<ForgotPasswordScreen />} />
      <Route path='/reset-password' element={<ResetPasswordScreen />} />
      <Route path='*' element={<PlaceholderScreen />} />
    </Routes>
  )
}

export default App
