import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

document.documentElement.setAttribute("translate", "no");
document.documentElement.classList.add("notranslate");
document.body.setAttribute("translate", "no");
document.body.classList.add("notranslate");

const rootElement = document.getElementById("root")!;
rootElement.setAttribute("translate", "no");
rootElement.classList.add("notranslate");

createRoot(rootElement).render(<App />);
