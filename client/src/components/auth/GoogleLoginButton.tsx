import React from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../../contexts/AuthContext';

const GoogleLoginButton: React.FC = () => {
  const { login } = useAuth();

  const handleSuccess = async (response: CredentialResponse) => {
    if (response.credential) {
      try {
        await login(response.credential);
      } catch (error) {
        console.error('Login failed:', error);
      }
    }
  };

  return (
    <div className="flex justify-center" id="google-login-btn">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => console.error('Google Login Failed')}
        theme="filled_black"
        size="large"
        shape="pill"
        text="signin_with"
        width="320"
      />
    </div>
  );
};

export default GoogleLoginButton;
