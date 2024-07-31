import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {AiOutlineSearch} from 'react-icons/ai'
import {FaMoon} from 'react-icons/fa'
import {FaSun} from 'react-icons/fa6'
import {Button,Dropdown,Avatar, theme}from 'flowbite-react'
import RoundButton from './ui/RoundButton'
import { useSelector ,useDispatch} from 'react-redux'
import { toggleTheme } from '../redux/theme/themeSlice'

function Header() {
    const [query,setQuery] = useState('');
    const {currentUser} = useSelector(state => state.user);
    const dispatch = useDispatch();
    const {theme} = useSelector(state => state.theme);

    const queryChangeHandler = (e) => (setQuery(e.target.value));
    const handleSignout = async () => {
        try {
          const res = await fetch('/api/user/signout', {
            method: 'POST',
          });
          const data = await res.json();
          if (!res.ok) {
            console.log(data.message);
          } else {
            dispatch(signoutSuccess());
          }
        } catch (error) {
          console.log(error.message);
        }
      };


  return (
    <>  
        <header>
        <div className='flex w-full h-auto p-2 bg-gradient-to-r from-blue-500 to bg-slate-500 justify-between items-center'>
            <Link to='/' >
                <h1 className='text-indigo-700 text-3xl'>Insightify</h1>
            </Link>

            <div className='px-10 hidden sm:flex gap-4 items-center w-[70%] justify-end'>
            <input
                type='text'
                placeholder='Search...'
                value={query}
                onChange={queryChangeHandler}
                className='inline-block w-80 h-auto p-2 rounded-xl focus:w-[40vw] border-2 border-blue-400 focus:border-blue-300 focus:font-bold'
            />
           
                <Button className='inline md:hidden'>
                    <AiOutlineSearch/>
                </Button> 
                <Button className='hidden md:inline-block'>
                    Search..
                </Button>
          
            </div>


            <div className='flex gap-6 items-center'>
            <Button 
            className='hidden md:inline-block' >
                Post..
            </Button>

            <Button className='w-8 h-8 text-center rounded-full pill outline bg-black dark:bg-orange-400' onClick={()=>dispatch(toggleTheme())}>
                {theme==='light' ? <FaMoon/> : <FaSun/>}
            </Button>
            
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar alt='user' img={currentUser.avatar} className='w-8 h-8 md:w-10 md:h-10' rounded/>
            }
            className='max-w-40'
          >
            <Dropdown.Header>
              <span className='block text-sm'>@{currentUser.username}</span>
              <span className='block text-sm font-medium truncate'>
                {currentUser.email}
              </span>
            </Dropdown.Header>
            <Link to={'/dashboard?tab=profile'}>
              <Dropdown.Item>Profile</Dropdown.Item>
            </Link>
            <Dropdown.Divider />
            <Dropdown.Item>Saved </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item>Upgrade </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item>Sign out </Dropdown.Item>
          </Dropdown>
        
            </div>


        </div>
        </header>
    </>
  )
}

export default Header
