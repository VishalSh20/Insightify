import React from 'react'

function RoundButton(props) {
  return (
    <button className={`w-10 h-10 rounded-full text-center p-2 ${props.className}`}>{props.content}</button>
  )
}

export default RoundButton
