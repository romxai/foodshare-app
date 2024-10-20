import React from 'react';
import dynamic from 'next/dynamic';

const SignupForm = dynamic(
  () => import("../../components/AuthForms/SignupForm").then(mod => mod.SignupForm),
  { ssr: false }
);

const SignupPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <SignupForm />
    </div>
  );
};

export default SignupPage;
