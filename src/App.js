import React, { useState } from 'react';
import Dashboard from './Dashboard';
import JobVacancyPage from './pages/JobVacancyPage';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  // 将页面状态传递给子组件
  return (
    <div className="App">
      {currentPage === 'dashboard' ? (
        <Dashboard onNavigate={setCurrentPage} />
      ) : (
        <JobVacancyPage onNavigate={setCurrentPage} />
      )}
    </div>
  );
}

export default App;