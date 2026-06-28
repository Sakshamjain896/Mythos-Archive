import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App.jsx'
import EgyptianCollection from './pages/EgyptianCollection.jsx'
import RomanArchive from './pages/RomanArchive.jsx'
import IndianCollection from './pages/IndianCollection.jsx'
import MayanCollection from './pages/MayanCollection.jsx'
import { useNavigationStore } from './store/navigationStore'
import { SocketProvider } from './SocketContext'
import CuratorHUD from './components/CuratorHUD'

export const Router = () => {
  const { currentPath } = useNavigationStore();

  useEffect(() => {
    const handlePopState = () => {
      // Direct set to avoid pushState loop
      useNavigationStore.setState({ currentPath: window.location.pathname });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  switch (currentPath) {
    case '/curate/egypt':
    case '/civilizations/egyptian':
      return <EgyptianCollection />;
    case '/curate/rome':
      return <RomanArchive />;
    case '/curate/india':
      return <IndianCollection />;
    case '/curate/mayan':
      return <MayanCollection />;
    default:
      return <App />;
  }
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SocketProvider>
      <Router />
      <CuratorHUD />
    </SocketProvider>
  </StrictMode>,
)
