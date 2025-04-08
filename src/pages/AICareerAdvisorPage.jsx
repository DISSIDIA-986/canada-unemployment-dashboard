import React from 'react';
import AICareerAdvisorDetail from '../components/AICareerAdvisorDetail.jsx';

const AICareerAdvisorPage = ({ onNavigate }) => {
  return (
    <div className="container mx-auto px-4 py-8 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">AI Career Advisor</h1>
        <button 
          onClick={() => onNavigate('dashboard')}
          className="text-blue-500 hover:text-blue-700"
        >
          &larr; Back to Dashboard
        </button>
      </div>
      
      <AICareerAdvisorDetail />
      
      <div className="text-sm text-gray-500 mt-8">
        Powered by Dify.ai platform and Claude Opus model
      </div>
    </div>
  );
};

export default AICareerAdvisorPage;