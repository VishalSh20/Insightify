import React from 'react'

function Button(props) {

  return (
    <div>
      <button className={`bg-blue-700 border-1 border-blue-500 rounded-2xl text-center px-4 py-2 cursor-pointer transition-colors active:bg-blue-400 ${props.className}`}>
        {props.statement}
      </button>
    </div>
  )
}

export default Button
