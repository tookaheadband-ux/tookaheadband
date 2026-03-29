import { createContext, useContext, useState, useEffect } from 'react';
import { fetchFeatureFlags } from '@/lib/api';

const FeatureFlagContext = createContext();

export function FeatureFlagProvider({ children }) {
  const [flags, setFlags] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchFeatureFlags()
      .then((r) => { setFlags(r.data); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  const isEnabled = (key) => !!flags[key];
  const getFlag = (key) => flags[key];
  const refresh = () => fetchFeatureFlags().then((r) => setFlags(r.data)).catch(() => {});

  return (
    <FeatureFlagContext.Provider value={{ flags, isEnabled, getFlag, loaded, refresh }}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export const useFeatureFlags = () => useContext(FeatureFlagContext);
