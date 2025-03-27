import React from 'react';
import JobVacancyChart from '../charts/JobVacancyChart';

const JobVacancyPage = ({ onNavigate }) => {
  return (
    <div className="container mx-auto px-4 py-8 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Job Vacancy Analysis</h1>
        <button 
          onClick={() => onNavigate('dashboard')}
          className="text-blue-500 hover:text-blue-700"
        >
          &larr; Back to Dashboard
        </button>
      </div>
      
      {/* 其余内容不变 */}
      <JobVacancyChart />
      
      <div className="text-sm text-gray-500 mt-8">
        Data Source: Statistics Canada. Job Vacancy and Wage Survey
      </div>
    </div>
  );
};

export default JobVacancyPage;