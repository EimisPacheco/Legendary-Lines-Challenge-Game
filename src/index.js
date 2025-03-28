import React from "react";
import { createRoot } from 'react-dom/client';
import App from './App';

import "./styles/styles.css";
import "./styles/logo.css";
import PhoneDetector from "./mobile";


const rootElement = document.getElementById('root');
const root = createRoot(rootElement); // Corrected line

root.render(<App />);