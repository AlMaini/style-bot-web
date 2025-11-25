import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { API_URL } from '../config';

const DashboardContext = createContext(null);

export const DashboardProvider = ({ children }) => {
  const { token } = useAuth();

  // Profile state
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);

  // Outfits state
  const [outfits, setOutfits] = useState([]);
  const [outfitsLoading, setOutfitsLoading] = useState(true);
  const [outfitsError, setOutfitsError] = useState(null);
  const [outfitsStale, setOutfitsStale] = useState(true);

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    if (!token) return;

    setProfileLoading(true);
    setProfileError(null);

    try {
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfileError(error.message);
    } finally {
      setProfileLoading(false);
    }
  }, [token]);

  // Fetch outfits data
  const fetchOutfits = useCallback(async () => {
    if (!token) return;

    setOutfitsLoading(true);
    setOutfitsError(null);

    try {
      const response = await fetch(`${API_URL}/api/images/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setOutfits([]);
          setOutfitsStale(false);
          setOutfitsLoading(false);
          return;
        }
        throw new Error('Failed to fetch outfits');
      }

      const data = await response.json();
      setOutfits(data.images || []);
      setOutfitsStale(false);
    } catch (error) {
      console.error('Error fetching outfits:', error);
      setOutfitsError(error.message);
    } finally {
      setOutfitsLoading(false);
    }
  }, [token]);

  // Refresh profile (for external components to call)
  const refreshProfile = useCallback(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Refresh outfits (for external components to call)
  const refreshOutfits = useCallback(() => {
    setOutfitsStale(true);
  }, []);

  // Mark outfits as stale when try-on completes
  const onTryOnComplete = useCallback(() => {
    // Refresh both profile (to update usage) and mark outfits as stale
    fetchProfile();
    setOutfitsStale(true);
  }, [fetchProfile]);

  // Initial fetch on mount
  useEffect(() => {
    if (token) {
      fetchProfile();
      fetchOutfits();
    }
  }, [token, fetchProfile, fetchOutfits]);

  // Refetch outfits if they become stale
  useEffect(() => {
    if (outfitsStale && !outfitsLoading && token) {
      fetchOutfits();
    }
  }, [outfitsStale, outfitsLoading, token, fetchOutfits]);

  const value = {
    // Profile
    profile,
    profileLoading,
    profileError,
    refreshProfile,

    // Outfits
    outfits,
    outfitsLoading,
    outfitsError,
    refreshOutfits,

    // Try-on callback
    onTryOnComplete,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
};
