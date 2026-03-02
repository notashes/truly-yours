import { useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { HomePage } from '@/pages/HomePage';
import { ProtocolRunnerPage } from '@/pages/ProtocolRunnerPage';
import { CompletionPage, StoppedPage } from '@/pages/CompletionPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { MoodPage } from '@/pages/MoodPage';
import { ManagePage } from '@/pages/ManagePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ReferenceListBuilderPage } from '@/pages/ReferenceListBuilderPage';
import { ReferenceListViewPage } from '@/pages/ReferenceListViewPage';
import { ChecklistBuilderPage } from '@/pages/ChecklistBuilderPage';
import { StandaloneChecklistRunnerPage } from '@/pages/StandaloneChecklistRunnerPage';
import { ProtocolBuilderPage } from '@/pages/ProtocolBuilderPage';
import { ModeEditorPage } from '@/pages/ModeEditorPage';
import { ContentStoreProvider, useContentStore } from '@/store/useContentStore';
import { setupFileHandler } from '@/lib/fileHandler';
import { parseProtocolFile } from '@/lib/protocolImport';

function FileHandlerSetup() {
  const { saveProtocol } = useContentStore();
  const navigate = useNavigate();

  useEffect(() => {
    setupFileHandler(async (file: File) => {
      const text = await file.text();
      const result = parseProtocolFile(text);
      if (result.success && result.protocol) {
        saveProtocol(result.protocol);
        navigate('/manage');
      }
    });
  }, [saveProtocol, navigate]);

  return null;
}

function App() {
  return (
    <ContentStoreProvider>
    <HashRouter>
      <FileHandlerSetup />
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/mood" element={<MoodPage />} />
          <Route path="/manage" element={<ManagePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="/protocol/:protocolId" element={<ProtocolRunnerPage />} />
        <Route path="/protocol/:protocolId/done" element={<CompletionPage />} />
        <Route path="/protocol/:protocolId/stopped" element={<StoppedPage />} />
        <Route path="/manage/protocols/new" element={<ProtocolBuilderPage />} />
        <Route path="/manage/protocols/:id/edit" element={<ProtocolBuilderPage />} />
        <Route path="/manage/checklists/new" element={<ChecklistBuilderPage />} />
        <Route path="/manage/checklists/:id/edit" element={<ChecklistBuilderPage />} />
        <Route path="/manage/checklists/:id" element={<StandaloneChecklistRunnerPage />} />
        <Route path="/manage/reference-lists/new" element={<ReferenceListBuilderPage />} />
        <Route path="/manage/reference-lists/:id/edit" element={<ReferenceListBuilderPage />} />
        <Route path="/manage/reference-lists/:id" element={<ReferenceListViewPage />} />
        <Route path="/manage/modes/new" element={<ModeEditorPage />} />
        <Route path="/manage/modes/:id/edit" element={<ModeEditorPage />} />
      </Routes>
    </HashRouter>
    </ContentStoreProvider>
  );
}

export default App;
