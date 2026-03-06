import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as Linking from 'expo-linking';
import { useAuth } from './AuthContext';
import { setViewerToken } from '../api/authFetch';

interface ViewerContextType {
  token: string | null;
  isViewer: boolean;
  clearToken: () => void;
}

const ViewerContext = createContext<ViewerContextType | null>(null);

export function ViewerProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setToken(null);
      return;
    }

    async function checkInitialUrl() {
      const url = await Linking.getInitialURL();
      if (url) {
        extractToken(url);
      }
    }

    function extractToken(url: string) {
      const parsed = Linking.parse(url);
      const viewerToken = parsed.queryParams?.token;
      if (typeof viewerToken === 'string') {
        setToken(viewerToken);
      }
    }

    checkInitialUrl();

    const subscription = Linking.addEventListener('url', (event) => {
      extractToken(event.url);
    });

    return () => subscription.remove();
  }, [user]);

  useEffect(() => {
    setViewerToken(token);
  }, [token]);

  function clearToken() {
    setToken(null);
  }

  return (
    <ViewerContext.Provider value={{ token, isViewer: token !== null, clearToken }}>
      {children}
    </ViewerContext.Provider>
  );
}

export function useViewer(): ViewerContextType {
  const context = useContext(ViewerContext);
  if (!context) {
    throw new Error('useViewer must be used within a ViewerProvider');
  }
  return context;
}
