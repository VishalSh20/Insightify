import React,{useState,useEffect} from 'react'
import ProfileSetting from '../components/ProfileSetting';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

function Settings() {
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
    <div>
      <ProfileSetting/> 
    </div>
  );
}

export default Settings
