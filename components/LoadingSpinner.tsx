import React from "react";

const LoadingSpinner: React.FC = () => {
  return (
    <div className="fixed inset-0 flex flex-col justify-center items-center bg-[#CCD9BF]">
      {/* Single spinner */}
      <div className="w-20 h-20 border-4 border-[#F9F3F0] border-t-[#1C716F] rounded-full animate-spin"></div>

      {/* Loading text */}
      <p className="mt-6 text-[#065553] font-korolev text-xl tracking-wide">
        Loading...
      </p>
    </div>
  );
};

export default LoadingSpinner;
