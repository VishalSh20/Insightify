import React from 'react'
import {BrowserRouter,Route,Routes} from 'react-router-dom'
import Signin from './Pages/Signin'
import Signup from './Pages/Signup'
import Home from './Pages/Home'
import About from './Pages/About'
import Header from './components/Header'

export default function App() {
  return (
    <BrowserRouter>
      <Header/>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/signin' element={<Signin/>}/>
        <Route path='/signup' element={<Signup/>}/>
      </Routes>
    </BrowserRouter>
  )
}
