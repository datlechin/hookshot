import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { RequestList } from '@/components/layout/RequestList';
import { DetailPanel } from '@/components/layout/DetailPanel';

function App() {
  const { theme, toggleTheme } = useTheme();
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);

  const handleCreateEndpoint = () => {
    // Placeholder - will be implemented in later tasks
    console.log('Create endpoint clicked');
  };

  const handleCloseDetailPanel = () => {
    setDetailPanelOpen(false);
  };

  return (
    <div className={theme}>
      <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
        <Header
          theme={theme}
          onToggleTheme={toggleTheme}
          onCreateEndpoint={handleCreateEndpoint}
        />

        {/* Main 3-panel layout - offset by header height (64px) */}
        <div className="flex h-[calc(100vh-64px)] mt-16">
          <Sidebar />
          <RequestList />
          <DetailPanel isOpen={detailPanelOpen} onClose={handleCloseDetailPanel} />
        </div>
      </div>
    </div>
  );
}

export default App;
