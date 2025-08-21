import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import { MantineProvider } from '@mantine/core';

const container = document.getElementById('container');
if (!container) {
  throw new Error('Root container not found');
}

const root = createRoot(container);
root.render(
  <MantineProvider
    defaultColorScheme="dark"
    theme={{ primaryColor: 'teal', defaultRadius: 'md' }}
  >
    <App />
  </MantineProvider>
);
