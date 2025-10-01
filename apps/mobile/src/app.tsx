import React from 'react';
import { Toaster } from 'react-hot-toast';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ArticleDetail } from './components/Article/ArticleDetail';
import { MobileLayout } from './components/Layout/MobileLayout';
import './index.css';
import { CategoryPage } from './pages/CategoryPage';
import { HomePage } from './pages/HomePage';
import { NotFound } from './pages/NotFound';

export const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<MobileLayout />}>
            <Route index element={<HomePage />} />
            <Route path="frontend" element={<CategoryPage />} />
            <Route path="backend" element={<CategoryPage />} />
            <Route path="ai" element={<CategoryPage />} />
            <Route path="mobile" element={<CategoryPage />} />
            <Route path="design" element={<CategoryPage />} />
          </Route>
          <Route path="/article/:id" element={<ArticleDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster position="top-center" />
      </div>
    </Router>
  );
};

export default App;