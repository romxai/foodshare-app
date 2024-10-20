import React from "react";
import SignupForm from "../../components/AuthForms/SignupForm";

const SignupPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <SignupForm />
    </div>
  );
};

export default SignupPage;
