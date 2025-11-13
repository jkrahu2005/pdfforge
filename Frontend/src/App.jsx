// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import About from './pages/About';
import JpgToPdf from './components/tools/JpgToPdf';
import WordToPdf from './components/tools/WordToPdf';
import PowerpointToPdf from './components/tools/PowerpointToPdf';
import MergePdf from './components/tools/MergePdf';
import RemovePages from './components/tools/RemovePages';
import SplitPdf from './components/tools/SplitPdf';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="tools/jpg-to-pdf" element={<JpgToPdf />} />
          <Route path="tools/word-to-pdf" element={<WordToPdf />} />
          <Route path="tools/powerpoint-to-pdf" element={<PowerpointToPdf />}/>
         <Route path="/tools/merge-pdf" element={<MergePdf />} />
       <Route path="/tools/remove-pages" element={<RemovePages />} />
       <Route path="/tools/split-pdf" element={<SplitPdf />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;