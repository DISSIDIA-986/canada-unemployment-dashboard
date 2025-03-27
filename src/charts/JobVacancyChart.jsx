import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

const JobVacancyChart = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedIndustries, setSelectedIndustries] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data/vacancy_data.json');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const jsonData = await response.json();
        setData(jsonData);
        
        // Set default selected industries (top 5 by vacancy rate)
        if (jsonData.industry_data && jsonData.industry_data.vacancy_rates) {
          const topIndustries = jsonData.industry_data.vacancy_rates
            .slice(0, 5)
            .map(item => item.industry);
          setSelectedIndustries(topIndustries);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Failed to load vacancy data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleIndustrySelection = (industry) => {
    if (selectedIndustries.includes(industry)) {
      setSelectedIndustries(selectedIndustries.filter(i => i !== industry));
    } else {
      setSelectedIndustries([...selectedIndustries, industry]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="mb-4">Loading job vacancy data...</div>
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="font-bold text-lg mb-4">Job Vacancy Data</h2>
        <div className="text-red-500">Error loading data: {error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="font-bold text-lg mb-4">Job Vacancy Data</h2>
        <div>No data available</div>
      </div>
    );
  }

  // Format data for the charts
  const formatTimeSeriesData = () => {
    return data.time_series.all_industries.map(item => ({
      date: item.date,
      vacancies: item.job_vacancies,
      employees: item.payroll_employees,
      rate: item.job_vacancy_rate
    }));
  };

  const formatIndustryData = () => {
    return data.industry_data.vacancy_rates
      .filter(item => item.job_vacancy_rate !== null)
      .slice(0, 15);
  };

  const formatIndustryTimeSeriesData = () => {
    const result = [];
    
    // Get the common dates across all selected industries
    const dateSet = new Set();
    selectedIndustries.forEach(industryName => {
      const industryKey = industryName
        .toLowerCase()
        .replace(/\s/g, '_')
        .replace(/,/g, '')
        .replace(/\(/g, '')
        .replace(/\)/g, '');
      
      if (data.time_series[industryKey]) {
        data.time_series[industryKey].forEach(item => {
          dateSet.add(item.date);
        });
      }
    });
    
    const dates = Array.from(dateSet).sort();
    
    // For each date, collect data from all selected industries
    dates.forEach(date => {
      const entry = { date };
      
      selectedIndustries.forEach(industryName => {
        const industryKey = industryName
          .toLowerCase()
          .replace(/\s/g, '_')
          .replace(/,/g, '')
          .replace(/\(/g, '')
          .replace(/\)/g, '');
        
        if (data.time_series[industryKey]) {
          const dateData = data.time_series[industryKey].find(item => item.date === date);
          if (dateData) {
            // Use only first 15 chars of industry name as key to avoid long labels
            const shortName = industryName.length > 15
              ? industryName.substring(0, 15) + '...'
              : industryName;
            entry[shortName] = dateData.job_vacancy_rate;
          }
        }
      });
      
      result.push(entry);
    });
    
    return result;
  };

  // Render functions for different tabs
  const renderOverviewTab = () => (
    <div>
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-3">Job Vacancy Rate Over Time</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formatTimeSeriesData()}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis 
                yAxisId="left"
                orientation="left"
                label={{ value: 'Vacancy Rate (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip formatter={(value) => value.toFixed(2)} />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="rate"
                name="Job Vacancy Rate (%)"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-3">Job Vacancies and Payroll Employees</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formatTimeSeriesData()}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis 
                yAxisId="left" 
                orientation="left"
                label={{ value: 'Job Vacancies', angle: -90, position: 'insideLeft' }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                label={{ value: 'Payroll Employees', angle: 90, position: 'insideRight' }}
              />
              <Tooltip formatter={(value) => value.toLocaleString()} />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="vacancies"
                name="Job Vacancies"
                stroke="#82ca9d"
                activeDot={{ r: 8 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="employees"
                name="Payroll Employees"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderIndustryTab = () => (
    <div>
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-3">
          Job Vacancy Rate by Industry ({data.latest_data.date})
        </h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formatIndustryData()}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis 
                type="category" 
                dataKey="industry" 
                width={180}
                tick={{ fontSize: 12 }}
              />
              <Tooltip formatter={(value) => value.toFixed(2) + '%'} />
              <Legend />
              <Bar 
                dataKey="job_vacancy_rate" 
                name="Job Vacancy Rate (%)" 
                fill="#8884d8" 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-3">Trend Comparison Across Industries</h3>
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Select industries to compare:</p>
          <div className="flex flex-wrap gap-2">
            {data.industry_data.vacancy_rates.slice(0, 20).map((item, index) => (
              <div
                key={item.industry}
                className={`px-3 py-1 rounded-full text-sm cursor-pointer ${
                  selectedIndustries.includes(item.industry) 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-500'
                }`}
                onClick={() => handleIndustrySelection(item.industry)}
              >
                {item.industry.length > 20 ? item.industry.substring(0, 20) + '...' : item.industry}
              </div>
            ))}
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formatIndustryTimeSeriesData()}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis label={{ value: 'Vacancy Rate (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => value ? value.toFixed(2) + '%' : 'N/A'} />
              <Legend />
              {selectedIndustries.map((industry, index) => {
                const shortName = industry.length > 15
                  ? industry.substring(0, 15) + '...'
                  : industry;
                return (
                  <Line
                    key={industry}
                    type="monotone"
                    dataKey={shortName}
                    name={shortName}
                    stroke={COLORS[index % COLORS.length]}
                    activeDot={{ r: 8 }}
                    connectNulls={true}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-xl">Job Vacancy Analysis</h2>
        <div className="text-sm text-gray-500">
          Last updated: {data.metadata.date_generated}
        </div>
      </div>

      <div className="mb-6 border-b">
        <div className="flex">
          <button
            className={`pb-2 px-4 ${activeTab === 'overview' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`pb-2 px-4 ${activeTab === 'industry' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
            onClick={() => setActiveTab('industry')}
          >
            Industry Analysis
          </button>
        </div>
      </div>

      <div>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'industry' && renderIndustryTab()}
      </div>

      <div className="text-xs text-gray-500 mt-6">
        Data Source: {data.metadata.source}
      </div>
    </div>
  );
};

export default JobVacancyChart;
