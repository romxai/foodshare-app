import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export const useAuthGuard = () => {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push('/login');
        }
      } catch (error) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);
}; 