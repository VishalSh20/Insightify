import React ,{ useState } from 'react'
import {createBrowserRouter,createRoutesFromElements, Route, RouterProvider} from 'react-router-dom'
import Layout from './components/Layout'
import Home from './Pages/Home'
import Signup from './Pages/Signup'
import Login from './Pages/Login'
import DashBoard from './Pages/DashBoard'
import Settings from './Pages/Settings'
import PrivateRoute from './components/PrivateRoute'
import CreatePost from './Pages/CreatePost'


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element=<Layout/> >
      <Route path='' element= <Home /> />
      <Route path='signup' element= <Signup/> />
      <Route path='login' element= <Login/> />
      <Route element=<PrivateRoute/> >
      <Route path='dashboard' element=<DashBoard/> />
      <Route path='settings' element=<Settings/> />
      <Route path='create-post/:postType' element=<CreatePost/> />
      
      </Route>
    </Route>
  )
)

function App() {
 
  return (
        <RouterProvider router={router} />
  )
}

export default App
