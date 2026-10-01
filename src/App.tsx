import React from 'react';
import { useMira } from './context/MiraContext';
import { Sidebar } from './components/sidebar/Sidebar';
import { Header } from './components/header/Header';
import { StateSimulatorBar } from './components/header/StateSimulatorBar';
import { AnimatedThemeBackground } from './components/background/AnimatedThemeBackground';
import { HomePage } from './pages/HomePage';
import { MyDayPage } from './pages/MyDayPage';
import { ChatPage } from './pages/ChatPage';
import { VisionPage } from './pages/VisionPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { ActionsPage } from './pages/ActionsPage';
import { StudioPage } from './pages/StudioPage';
import { SettingsPage } from './pages/SettingsPage';
import { DocumentPreviewModal } from './components/documents/DocumentPreviewModal';
import { MiraStudioModal } from './components/studio/MiraStudioModal';

export const App: React.FC = () => {
  const { devMode, activeNavTab } = useMira();

  const renderActivePage = () => {
    switch (activeNavTab) {
      case 'Home':
        return <HomePage />;
      case 'MyDay':
        return <MyDayPage />;
      case 'Chat':
        return <ChatPage />;
      case 'Vision':
        return <VisionPage />;
      case 'Documents':
        return <DocumentsPage />;
      case 'Actions':
        return <ActionsPage />;
      case 'Studio':
        return <StudioPage />;
      case 'Settings':
        return <SettingsPage />;
      default:
        return <HomePage />;
    }
  };


  return (
    <div className="mira-app-shell">
      {/* Dynamic Theme Animated Background Motion */}
      <AnimatedThemeBackground />

      {/* Left Navigation Sidebar */}
      <Sidebar />

      {/* Main Companion Workspace with Dedicated Page Routing */}
      <div className="mira-main-area">
        {/* Topbar with 6-Step Loop Tracker */}
        <Header />

        {/* Developer Mode: Agent State Simulator Bar */}
        {devMode && <StateSimulatorBar />}

        {/* Dynamic Page Container */}
        <main className="companion-page-viewport">
          {renderActivePage()}
        </main>
      </div>

      {/* Global Modals */}
      <DocumentPreviewModal />
      <MiraStudioModal />
    </div>
  );
};
