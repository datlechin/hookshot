import { useState } from 'react';
import { useTheme } from '@/hooks';
import { Header, Sidebar, RequestList, DetailPanel } from '@/components/layout';

function App() {
  const { theme, toggleTheme } = useTheme();
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    'connected' | 'connecting' | 'disconnected' | 'polling'
  >('disconnected');

  const handleCreateEndpoint = () => {
    // Placeholder - will be implemented in later tasks
    console.log('Create endpoint clicked');
  };

  const handleCloseDetailPanel = () => {
    setDetailPanelOpen(false);
  };

  const handleConnectionStatusChange = (
    status: 'connected' | 'connecting' | 'disconnected' | 'polling'
  ) => {
    setConnectionStatus(status);
  };

  return (
    <div className={theme}>
      <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
        <Header
          theme={theme}
          onToggleTheme={toggleTheme}
          onCreateEndpoint={handleCreateEndpoint}
          connectionStatus={connectionStatus}
        />

        {/* Main 3-panel layout - offset by header height (64px) */}
        <div className="flex h-[calc(100vh-64px)] mt-16">
          <Sidebar />
          <RequestList onConnectionStatusChange={handleConnectionStatusChange} />
          <DetailPanel isOpen={detailPanelOpen} onClose={handleCloseDetailPanel} />
        </div>
      </div>
    </div>
  );
}

export default App;
