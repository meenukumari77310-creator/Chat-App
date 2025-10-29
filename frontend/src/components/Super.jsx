import React, { useEffect, useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apis } from '../utils/apis';

export const Super = () => {
  const [isAuth, setIsAuth] = useState(null); // null = unknown, true = authenticated, false = not
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const getRouteAccess = async () => {
      setLoading(true);
      try {
        const response = await fetch(apis().getAccess, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        const result = await response.json();

        if (!response.ok || !result?.status) {
          throw new Error(result?.message || 'Unauthorized');
        }

        setIsAuth(true);
      } catch (error) {
        setIsAuth(false);
        if (location.pathname !== '/login') {
          toast.error('Session expired. Please login again.');
        }
      } finally {
        setLoading(false);
      }
    };

    getRouteAccess();
  }, [location.pathname]);

  if (loading || isAuth === null) {
    return null;
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};