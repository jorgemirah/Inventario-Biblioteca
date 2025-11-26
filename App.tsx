
import React, { useState } from 'react';
import { InventorySession, ScreenName } from './types';
import { HomeScreen } from './screens/HomeScreen';
import { ScannerScreen } from './screens/ScannerScreen';
import { DetailsScreen } from './screens/DetailsScreen';

const App: React.FC = () => {
  // Default screen is HOME, which now includes the creation form
  const [screen, setScreen] = useState<ScreenName>('HOME');
  const [activeSession, setActiveSession] = useState<InventorySession | null>(null);

  const handleSessionCreated = (session: InventorySession) => {
    setActiveSession(session);
    setScreen('SCANNER');
  };

  const handleOpenSession = (session: InventorySession) => {
    setActiveSession(session);
    setScreen('SCANNER');
  };

  const handleSessionUpdate = (updatedSession: InventorySession) => {
    setActiveSession(updatedSession);
  };

  const handleBackToHome = () => {
    setScreen('HOME');
    setActiveSession(null);
  };

  const handleBackToScanner = () => {
    setScreen('SCANNER');
  };

  const handleViewList = () => {
    setScreen('DETAILS');
  };

  // Router Switch
  switch (screen) {
    case 'HOME':
      return <HomeScreen onSessionCreated={handleSessionCreated} onOpenSession={handleOpenSession} />;
    
    // NEW_SESSION case removed as it is merged into HOME
    
    case 'SCANNER':
      if (!activeSession) return <HomeScreen onSessionCreated={handleSessionCreated} onOpenSession={handleOpenSession} />;
      return (
        <ScannerScreen 
          session={activeSession} 
          onBack={handleBackToHome}
          onViewList={handleViewList} 
          onSessionUpdate={handleSessionUpdate}
        />
      );

    case 'DETAILS':
      if (!activeSession) return <HomeScreen onSessionCreated={handleSessionCreated} onOpenSession={handleOpenSession} />;
      return (
        <DetailsScreen 
          session={activeSession} 
          onBack={handleBackToScanner} 
          onSessionUpdate={handleSessionUpdate}
        />
      );
      
    default:
      return <HomeScreen onSessionCreated={handleSessionCreated} onOpenSession={handleOpenSession} />;
  }
};

export default App;
