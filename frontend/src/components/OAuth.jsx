import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { loginSuccess,loginFailure } from '../redux/User/userSlice.js'; // Adjust the import path as needed
import { AiFillGoogleCircle } from 'react-icons/ai';
import { Button } from 'flowbite-react'; // Assuming you are using Flowbite for the Button component

const clientId = 'YOUR_GOOGLE_CLIENT_ID';

const OAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleLoginSuccess = async (response) => {
    // try {
    //   const res = await fetch('/api/auth/google', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       token: response.credential,
    //     }),
    //   });

    //   const data = await res.json();

    //   if (res.ok) {
    //     dispatch(signInSuccess(data));
    //     navigate('/');
    //   } else {
    //     console.error('Failed to login:', data.message);
    //   }
    // } catch (error) {
    //   console.error('Login error:', error);
    // }
    console.log(response);

  };

  const handleGoogleLoginError = (error) => {
    console.error('Google login failed:', error);
  };
    console.log(import.meta.env.VITE_OAUTH_CLIENT_ID);
  return (
   
      <GoogleLogin
        onSuccess={handleGoogleLoginSuccess}
        onError={handleGoogleLoginError}
      />
  );
};

export default OAuth;
