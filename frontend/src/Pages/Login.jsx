import {Alert,Spinner} from 'flowbite-react'
import {FaGoogle} from 'react-icons/fa'
import React, { useState } from 'react';
import {Link, useNavigate } from 'react-router-dom';
import { loginStart,loginSuccess,loginFailure } from '../redux/User/userSlice';
import {useSelector,useDispatch} from 'react-redux'
import Card from '../components/ui/Card';
import OAuth from '../components/OAuth';

const Login = () => {
    const [formData,setFormData] = useState({});
    const {loading,error} = useSelector((state) => (state.user));
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleFormDataChange = (e) => {
        setFormData({...formData,[e.target.id]:e.target.value.trim()});
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
          return dispatch(loginFailure('Please fill all the fields'));
        }
        try {
          dispatch(loginStart());
          console.log(formData, typeof formData);
          const res = await fetch('http://localhost:4000/api/v1/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });
          
          // Handle non-OK responses
          if (!res.ok) {
            const errorData = await res.json();
            return dispatch(loginFailure(errorData.message || 'Login failed'));
          }
          
          const data = await res.json();
          if (res.ok) {
            dispatch(loginSuccess(data));
            navigate('/');
          }
        } catch (error) {
          dispatch(loginFailure(error.message));
        }
      };
      
   
  return (
    <div>

    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left Side */}
      <div className="w-full md:w-1/2 bg-gradient-to-r from-green-200 via-teal-400 to-cyan-600 text-white flex flex-col justify-center items-center p-8">
        <img src='' alt="Insightify Logo" className="w-32 h-32 mb-4" />
        <p className="text-xl text-slate-500">Welcome to Insightify, the ultimate destination for tech enthusiasts! Our platform is designed to help you explore, share, and grow within the tech community. Whether you're here to read insightful blogs, watch engaging videos, participate in lively discussions, or receive personalized AI-powered recommendations and summaries, Insightify has it all. </p>
      </div>

      {/* Right Side */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8">
        <h2 className="text-3xl font-bold mb-2 text-blue-900">Login </h2>
        <div className='w-1/4 border-b-2 border-blue-400 mb-2'></div>
        {
            error && 
            <Alert color='failure' className='my-4' >
                {error}
            </Alert>
        }
        <form className="w-full max-w-sm"
            onChange={handleFormDataChange}
            >
          <div className="mb-4">
            <label className="block font-bold mb-2 text-blue-800" htmlFor="email">
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="email"
            />
          </div>
          <div className="mb-6">
            <label className="block text-blue-800 font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="******************"
            />
          </div>
          <div className="flex flex-col gap-4 mb-2 items-center justify-between">
            <button
              className="bg-gradient-to-r from-purple-200 via-indigo-400 to-violet-600 hover:from-purple-500 hover:to-blue-400 text-slate-800 font-bold py-2 px-4 rounded-xl focus:outline-none focus:shadow-lg shadow-slate-600 w-full text-center"
              type="submit"
              onClick={handleSubmit}
            >
              {loading ? <Spinner/> : "Login"}
            </button>
            
              <OAuth/>
 
          </div>
          <div className='text-sm'>
           Don't have an account? <Link to='/signup' className='text-blue-600'>Sign up Instead</Link>
          </div>
        </form>

        </div>
    </div>
            
        <div className="mt-10 flex flex-wrap justify-evenly gap-10">
        <Card heading='Discover New Insights' description='Dive into a wealth of knowledge with insightful blogs, detailed tutorials, and engaging video content curated by tech experts.' className='w-40 min-h-40 bg-gradient-to-r from-cyan-50 via-zinc-100 to-blue-100'/>
        <Card heading='Discover New Insights' description='Dive into a wealth of knowledge with insightful blogs, detailed tutorials, and engaging video content curated by tech experts.' className='w-40 min-h-40 bg-gradient-to-r from-cyan-50 via-zinc-100 to-blue-100'/>
        <Card heading='Discover New Insights' description='Dive into a wealth of knowledge with insightful blogs, detailed tutorials, and engaging video content curated by tech experts.' className='w-40 min-h-40 bg-gradient-to-r from-cyan-50 via-zinc-100 to-blue-100'/>
        <Card heading='Discover New Insights' description='Dive into a wealth of knowledge with insightful blogs, detailed tutorials, and engaging video content curated by tech experts.' className='w-40 min-h-40 bg-gradient-to-r from-cyan-50 via-zinc-100 to-blue-100'/>
        <Card heading='Discover New Insights' description='Dive into a wealth of knowledge with insightful blogs, detailed tutorials, and engaging video content curated by tech experts.' className='w-40 min-h-40 bg-gradient-to-r from-cyan-50 via-zinc-100 to-blue-100'/>

        </div>
    </div>

  );
};

export default Login;
