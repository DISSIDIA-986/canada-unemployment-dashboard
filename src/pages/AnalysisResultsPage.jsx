import React, { useState } from 'react';
import AnalysisResultsChart from '../charts/AnalysisResultsChart';

const AnalysisResultsPage = ({ onNavigate }) => {
  return (
    <div className="container mx-auto px-4 py-8 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Advanced Analysis Results</h1>
        <button 
          onClick={() => onNavigate('dashboard')}
          className="text-blue-500 hover:text-blue-700"
        >
          &larr; Back to Dashboard
        </button>
      </div>
      
      <AnalysisResultsChart />
      
      <div className="text-sm text-gray-500 mt-8">
        Data Source: Statistics Canada and Advanced Python Analysis Results
      </div>
    </div>
  );
};

export default AnalysisResultsPage;