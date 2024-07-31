import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import { useSelector } from 'react-redux'

function Layout() {
  const {currentUser} = useSelector(state => state.user);
  console.log(currentUser)

  return (currentUser ? (
    <>
    <Header/>
    <Outlet/>
    <Footer/>
    </>
  ) :
   (
    <>
      <Outlet/>
      <Footer/>
    </>
  ))
}

export default Layout
