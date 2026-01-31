import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client'
import { BrowserRouter ,Routes ,Route} from "react-router";


import Dashboard from './Dashboard.jsx';
import './index.css'
import LandingPage from './LandingPage.jsx';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/*" element={<LandingPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  </BrowserRouter>,
)
