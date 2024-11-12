import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export const useAuthCheck = () => {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      if (!user) {
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);
}; 