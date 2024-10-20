import React from 'react';
import LoginForm from "../../components/AuthForms/LoginForm";

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <LoginForm />
    </div>
  );
};

export default LoginPage;
