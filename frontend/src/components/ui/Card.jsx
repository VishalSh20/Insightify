import React from 'react'

function Card(props) {
  return (
    <div>
      <div className={`flex flex-col p-4 object-cover overflow-hidden ${props.className}`}>
        {props.image ? <img src={props.image} alt ='Card Image' className='w-[80vw] h-48 md:w-48'/> : "" }
        <h1 className='text-slate-900 font-bold' >{props.heading}</h1>
        <p className='text-slate-500 font-semibold'>{props.description}</p>
      </div>
    </div>
  )
}

export default Card
