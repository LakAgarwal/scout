import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import MarketExplorer from './pages/MarketExplorer';
import AIAnalyst from './pages/AIAnalyst';
import CompetitorIntelligence from './pages/CompetitorIntelligence';
import ProductAnalysis from './pages/ProductAnalysis';
import ProjectIngestion from './pages/ProjectIngestion';

export default function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/explorer" element={<MarketExplorer />} />
            <Route path="/analyst" element={<AIAnalyst />} />
            <Route path="/competitor" element={<CompetitorIntelligence />} />
            <Route path="/product" element={<ProductAnalysis />} />
            <Route path="/ingestion" element={<ProjectIngestion />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
