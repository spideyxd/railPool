import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

/**
 * Google Login Button Component
 * Handles Google OAuth authentication
 */
const GoogleLoginButton = ({ onSuccess, onError, size = 'large' }) => {
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Send token to backend
      const response = await authAPI.googleLogin(credentialResponse.credential);
      
      // Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      if (onSuccess) {
        onSuccess(response.data.user);
      }
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Google login failed:', error);
      if (onError) {
        onError(error);
      }
    }
  };

  const handleGoogleError = () => {
    console.log('Google Login Failed');
    if (onError) {
      onError(new Error('Google login failed'));
    }
  };

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        size={size}
        theme="dark"
      />
    </div>
  );
};

export default GoogleLoginButton;
