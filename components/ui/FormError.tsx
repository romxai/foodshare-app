import { useRouter } from 'next/navigation';

interface FormErrorProps {
  message: string;
  includeLoginLink?: boolean;
}

export const FormError: React.FC<FormErrorProps> = ({ message, includeLoginLink }) => {
  const router = useRouter();

  // Function to render message with login link if needed
  const renderMessage = () => {
    if (includeLoginLink && (message.includes("already registered"))) {
      const parts = message.split("Please login");
      return (
        <>
          {parts[0]}
          Please{" "}
          <span 
            onClick={() => router.push('/login')}
            className="text-[#1C716F] hover:text-[#065553] cursor-pointer underline"
          >
            login
          </span>
          {" instead."}
        </>
      );
    }
    return message;
  };

  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-2 rounded-r-md">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-4 w-4 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-2">
          <p className="text-xs text-red-600 font-['Verdana Pro Cond']">
            {renderMessage()}
          </p>
        </div>
      </div>
    </div>
  );
}; 