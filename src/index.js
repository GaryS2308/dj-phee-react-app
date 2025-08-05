import React from 'react';
import { createRoot } from 'react-dom/client'; // ✅ NEW import
import App from './App';
import './styles/styles.css';

// ✅ New React 18-compatible render method
const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
// ✅ This ensures the app is rendered correctly in React 18
// ✅ Using createRoot for concurrent rendering capabilities
// ✅ React.StrictMode helps identify potential problems in the app
// ✅ This is the entry point for the React application, rendering the main App component
// ✅ The styles are imported globally to apply consistent styling across the app
// ✅ The App component is the main component that includes all other components like HeroSection, AboutPhee, PastEvents, and BookingForm
// ✅ The root element is where the React app is mounted in the HTML file
// ✅ This setup is essential for initializing a React application with modern