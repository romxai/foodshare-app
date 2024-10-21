'use client';

import { ErrorBoundary } from 'react-error-boundary';

const ErrorFallback = ({ error }: { error: Error }) => {
  return (
    <div
      role="alert"
      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
    >
      <strong className="font-bold">Oops! Something went wrong:</strong>
      <pre className="mt-2 text-sm">{error.message}</pre>
    </div>
  );
};

export default function ErrorBoundaryWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      {children}
    </ErrorBoundary>
  );
}
