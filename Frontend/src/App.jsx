import React from 'react'
import { Route, Routes } from 'react-router'
import AuthMiddleware from './Middlewares/AuthMiddleware'
import HomeScreeen from './Screens/HomeScreen/HomeScreen'
import LogInScreen from './Screens/LogInScreen/LogInScreen'
import RegisterScreen from './Screens/RegisterScreen/RegisterScreen'
import VerifyEmailScreen from './Screens/VerifyEmailScreen/VerifyEmailScreen'
import ResendEmailVerificationScreen from './Screens/ResendEmailVerificationScreen/ResendEmailVerificationScreen'
import ForgotPasswordScreen from './Screens/ForgotPasswordScreen/ForgotPasswordScreen'
import ResetPasswordScreen from './Screens/ResetPasswordScreen/ResetPasswordScreen'

const App = () => {
  return (
    <Routes>
      <Route element={<AuthMiddleware />}>
        <Route path='/' element={<HomeScreeen />} />
      </Route>
      <Route path='/login' element={<LogInScreen />} />
      <Route path='/register' element={<RegisterScreen />} />
      <Route path='/verify-email' element={<VerifyEmailScreen />} />
      <Route path='/resend-email-verification' element={<ResendEmailVerificationScreen />} />
      <Route path='/forgot-password' element={<ForgotPasswordScreen />} />
      <Route path='/reset-password' element={<ResetPasswordScreen />} />
    </Routes>
  )
}

export default App
