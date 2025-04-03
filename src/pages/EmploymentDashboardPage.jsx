// src/pages/EmploymentDashboardPage.jsx
import React from 'react';
import EmploymentDashboard from '../components/dashboard/EmploymentDashboard.jsx';

const EmploymentDashboardPage = ({ onNavigate }) => {
  return (
    <div>
      <div className="py-4 px-6 bg-gray-100 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Canadian Employment Insights</h1>
        <button 
          onClick={() => onNavigate('dashboard')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          &larr; Back to Main Dashboard
        </button>
      </div>
      
      <EmploymentDashboard />
    </div>
  );
};

export default EmploymentDashboardPage;