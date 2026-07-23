import { Box, Snackbar, Alert } from '@mui/material';
import { useChat } from '../hooks/useChat';
import { useSettings } from '../hooks/useSettings';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import SettingsModal from './SettingsModal';

export default function ChatLayout() {
  const {
    settings,
    updateSettings,
    isOpen: isSettingsOpen,
    openSettings,
    closeSettings,
    isConfigured,
  } = useSettings();

  const {
    sessions,
    activeSession,
    activeSessionId,
    messages,
    isLoading,
    isSending,
    error,
    createSession,
    selectSession,
    sendMessage,
    renameSession,
    getTitle,
    clearError,
  } = useChat(settings);

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        getTitle={getTitle}
        onSelectSession={selectSession}
        onNewSession={createSession}
        onRenameSession={renameSession}
        onOpenSettings={openSettings}
        isConfigured={isConfigured}
      />

      <ChatWindow
        session={activeSession}
        title={activeSessionId ? getTitle(activeSessionId) : ''}
        messages={messages}
        isLoading={isLoading}
        isSending={isSending}
        onSendMessage={sendMessage}
        onNewChat={createSession}
        selectedModel={settings.selectedModel}
      />

      <SettingsModal
        open={isSettingsOpen}
        settings={settings}
        onSave={updateSettings}
        onClose={closeSettings}
      />

      {/* Error toast */}
      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={clearError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="error"
          onClose={clearError}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
