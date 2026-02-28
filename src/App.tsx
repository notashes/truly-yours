import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { HomePage } from '@/pages/HomePage';
import { ProtocolRunnerPage } from '@/pages/ProtocolRunnerPage';
import { CompletionPage, StoppedPage } from '@/pages/CompletionPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { MoodPage } from '@/pages/MoodPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/mood" element={<MoodPage />} />
        </Route>
        <Route path="/protocol/:protocolId" element={<ProtocolRunnerPage />} />
        <Route path="/protocol/:protocolId/done" element={<CompletionPage />} />
        <Route path="/protocol/:protocolId/stopped" element={<StoppedPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
