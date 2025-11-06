// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import About from './pages/About';
import JpgToPdf from './components/tools/JpgToPdf';
import WordToPdf from './components/tools/WordToPdf';
import PowerpointToPdf from './components/tools/PowerpointToPdf';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="tools/jpg-to-pdf" element={<JpgToPdf />} />
          <Route path="tools/word-to-pdf" element={<WordToPdf />} />
          <Route path="tools/powerpoint-to-pdf" element={<PowerpointToPdf />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;