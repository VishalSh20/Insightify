import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import DashProfile from '../components/DashProfile';
import { useSelector } from 'react-redux';
import DashSidebar from '../components/DashSidebar';
import { Dropdown } from 'flowbite-react';


function DashBoard() {
    const location = useLocation();
    const [tab,setTab] = useState('');
    const {currentUser} = useSelector(state => state.user);

    useEffect(()=>{
        const urlParams = new URLSearchParams(location.search);
        const paramsTab = urlParams.get('tab');
        if(paramsTab){
            setTab((tab)=>(paramsTab));
            console.log(tab);
        }
    }
    ,[location.search]);

  return (
      <div className='flex '>
        <DashSidebar/>
        <DashProfile/>
    </div>
  )
}

export default DashBoard
