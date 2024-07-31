import React,{useId, useState} from 'react'
import {MdCancel} from 'react-icons/md'

function Warning(props) {
    const nextVisibility = ((!props.message) ? "hidden" : "block");
    console.log(nextVisibility);
    const [visible,setVisible] = useState(nextVisibility);
    console.log(visible,props.message);
    const onCancelHandler = ()=>{
      setVisible('hidden');
    }

  return (
    <div className={`bg-red-500 text-slate-800 flex flex-row justify-around p-2 rounded-xl ${visible}`} >
     <p>{props.message} !! </p> 
     <button onClick={onCancelHandler}><MdCancel/></button> 
    </div>
  )
}

export default Warning
