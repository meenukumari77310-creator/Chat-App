import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apis } from '../utils/apis';

export const useCheckAuth = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true; // 👈 Flag to track if component is mounted

    const checkToken = async () => {
      try {
        const response = await fetch(apis().getAccess, {
          method: 'POST',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error("Session expired");
        }

        const result = await response.json();

        if (isMounted) {
          if (result?.status) {
            setIsAuthenticated(true);
          } else {
            navigate('/login');
          }
        }
      } catch (err) {
        if (isMounted) {
          navigate('/login');
        }
      } finally {
        if (isMounted) setLoading(false); // ✅ Only update state if still mounted
      }
    };

    checkToken();

    return () => {
      isMounted = false; // ✅ Cleanup: prevent state updates after unmount
    };
  }, [navigate]);

  return { isAuthenticated, loading };
};   