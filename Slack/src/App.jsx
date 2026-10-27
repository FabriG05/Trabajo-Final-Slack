import React from 'react'
import { Route, Routes } from 'react-router'
import HomeScreeen from './Screens/HomeScreen/HomeScreen'
import LogInScreen from './Screens/LogInScreen/LogInScreen'
import RegisterScreen from './Screens/RegisterScreen/RegisterScreen'

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<HomeScreeen/>}/>
      <Route path='/login' element={<LogInScreen/>}/>
      <Route path='/register' element={<RegisterScreen/>} />
    </Routes>
  )
}


export default App
