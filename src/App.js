import React, { useState } from 'react';
import Dashboard from './Dashboard';
import JobVacancyPage from './pages/JobVacancyPage';
import SalaryPage from './pages/SalaryPage';
import AnalysisResultsPage from './pages/AnalysisResultsPage';
import EmploymentDashboardPage from './pages/EmploymentDashboardPage';
import AICareerAdvisorPage from './pages/AICareerAdvisorPage';
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
      ) : currentPage === 'employmentDashboard' ? ( // 添加新的条件
        <EmploymentDashboardPage onNavigate={setCurrentPage} />
      ) : currentPage === 'aiCareerAdvisor' ? ( // 添加新的条件
        <AICareerAdvisorPage onNavigate={setCurrentPage} />
      ) : (
        <Dashboard onNavigate={setCurrentPage} />
      )}
    </div>
  );
}

export default App;