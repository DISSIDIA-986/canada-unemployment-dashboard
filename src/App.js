import React, { useState } from 'react';
import Dashboard from './Dashboard';
import JobVacancyPage from './pages/JobVacancyPage';
import SalaryPage from './pages/SalaryPage';
import AnalysisResultsPage from './pages/AnalysisResultsPage';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  // 根据当前页面状态显示相应的组件
  return (
    <div className="App">
      {currentPage === 'dashboard' ? (
        <Dashboard onNavigate={setCurrentPage} />
      ) : currentPage === 'jobVacancy' ? (
        <JobVacancyPage onNavigate={setCurrentPage} />
      ) : currentPage === 'salary' ? (
        <SalaryPage onNavigate={setCurrentPage} />
      ) : currentPage === 'analysisResults' ? (
        <AnalysisResultsPage onNavigate={setCurrentPage} />
      ) : (
        <Dashboard onNavigate={setCurrentPage} />
      )}
    </div>
  );
}

export default App;