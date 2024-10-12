import React from 'react';
import SignupForm from '../components/SignupForm';

const SignupPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6">Sign Up</h1>
        <SignupForm />
      </div>
    </div>
  );
};

export default SignupPage;
