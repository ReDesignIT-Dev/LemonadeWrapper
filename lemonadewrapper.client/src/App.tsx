import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import ChatLayout from './components/ChatLayout';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ChatLayout />
    </ThemeProvider>
  );
}

export default App;
