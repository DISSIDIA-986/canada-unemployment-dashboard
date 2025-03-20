import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Dashboard = () => {
  // State variables
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [albertaData, setAlbertaData] = useState([]);
  const [provinceData, setProvinceData] = useState([]);
  const [industryData, setIndustryData] = useState([]);
  const [sexData, setSexData] = useState([]);
  const [ageData, setAgeData] = useState([]);
  const [cityData, setCityData] = useState([]);
  const [selectedProvinces, setSelectedProvinces] = useState(['Alberta', 'Canada', 'British Columbia', 'Ontario']);
  const [selectedIndustries, setSelectedIndustries] = useState(['Total, all industries', 'Construction']);
  const [selectedTimeframe, setSelectedTimeframe] = useState('5y');
  const [activeTab, setActiveTab] = useState('trends');
  
  // Colors for consistent visualization
  const colorScale = d3.scaleOrdinal()
    .domain(['Alberta', 'Canada', 'British Columbia', 'Ontario', 'Quebec', 'Male', 'Female'])
    .range(['#4285F4', '#DB4437', '#F4B400', '#0F9D58', '#AB47BC', '#1E88E5', '#D81B60']);
    
  const industryColorScale = d3.scaleOrdinal()
    .domain(['Total, all industries', 'Construction', 'Manufacturing', 'Professional, scientific and technical services'])
    .range(['#4285F4', '#DB4437', '#F4B400', '#0F9D58']);

  // Timeframe options
  const timeframes = {
    '1y': 12,
    '3y': 36,
    '5y': 60,
    '10y': 120,
    'all': Infinity
  };

  // Helper functions
  const formatDate = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };
  
  const filterByTimeframe = (data) => {
    if (!data || data.length === 0) return [];
    
    const months = timeframes[selectedTimeframe];
    if (months === Infinity) return data;
    
    const latestDate = d3.max(data, d => d.date);
    const cutoffDate = new Date(latestDate);
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    
    return data.filter(d => d.date >= cutoffDate);
  };
  
  // Get available provinces, industries, etc.
  const getAvailableProvinces = () => {
    if (!provinceData || provinceData.length === 0) return [];
    
    const provinces = new Set();
    provinceData.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key !== 'date' && key !== 'formattedDate') {
          provinces.add(key);
        }
      });
    });
    
    return Array.from(provinces)
      .filter(province => province !== 'undefined' && province !== 'null')
      .sort();
  };
  
  const getAvailableIndustries = () => {
    if (!industryData || industryData.length === 0) return [];
    
    const industries = new Set();
    industryData.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key !== 'date' && key !== 'formattedDate') {
          industries.add(key);
        }
      });
    });
    
    return Array.from(industries)
      .filter(industry => industry !== 'undefined' && industry !== 'null')
      .sort();
  };

  // Data processing functions
  const processAlbertaData = (data) => {
    if (!data || !Array.isArray(data)) return [];
    
    // Filter for unemployment rate data for Alberta
    const filteredData = data.filter(item => 
      item.GeoName === "Alberta" && 
      (item.Characteristic === "Unemployment rate" || item.Characteristics === "Unemployment rate")
    );
    
    return filteredData.map(item => ({
      date: new Date(item.Date),
      value: item.Value || 0,
      formattedDate: formatDate(new Date(item.Date))
    })).sort((a, b) => a.date - b.date);
  };
  
  const processProvinceData = (data) => {
    if (!data || !Array.isArray(data)) return [];
    
    // Filter for unemployment rate data
    const filteredData = data.filter(item => 
      (item.Characteristic === "Unemployment rate" || item.Characteristics === "Unemployment rate")
    );
    
    // Group by date
    const groupedByDate = d3.group(filteredData, d => d.Date);
    
    // Convert to array of objects with date and province values
    return Array.from(groupedByDate, ([dateStr, items]) => {
      const obj = { 
        date: new Date(dateStr), 
        formattedDate: formatDate(new Date(dateStr)) 
      };
      
      // Add each province's value
      items.forEach(item => {
        if (item.GeoName) {
          obj[item.GeoName] = item.Value || 0;
        }
      });
      
      return obj;
    }).sort((a, b) => a.date - b.date);
  };
  
  const processIndustryData = (data) => {
    if (!data || !Array.isArray(data)) return [];
    
    // Filter for unemployment rate data for Alberta
    const filteredData = data.filter(item => 
      item.GeoName === "Alberta" && 
      (item.Characteristic === "Unemployment rate" || item.Characteristics === "Unemployment rate")
    );
    
    // Group by date
    const groupedByDate = d3.group(filteredData, d => d.Date);
    
    // Convert to array of objects with date and industry values
    return Array.from(groupedByDate, ([dateStr, items]) => {
      const obj = { 
        date: new Date(dateStr), 
        formattedDate: formatDate(new Date(dateStr)) 
      };
      
      // Add each industry's value
      items.forEach(item => {
        if (item["NAICS Description"]) {
          obj[item["NAICS Description"]] = item.Value || 0;
        } else if (item.NAICS) {
          obj[item.NAICS] = item.Value || 0;
        }
      });
      
      return obj;
    }).sort((a, b) => a.date - b.date);
  };
  
  const processSexData = (data) => {
    if (!data || !Array.isArray(data)) return [];
    
    // Filter for unemployment rate data for Alberta
    const filteredData = data.filter(item => 
      item.GeoName === "Alberta" && 
      (item.Characteristic === "Unemployment rate" || item.Characteristics === "Unemployment rate")
    );
    
    // Group by date
    const groupedByDate = d3.group(filteredData, d => d.Date);
    
    // Convert to array of objects with date and sex values
    return Array.from(groupedByDate, ([dateStr, items]) => {
      const obj = { 
        date: new Date(dateStr), 
        formattedDate: formatDate(new Date(dateStr)) 
      };
      
      // Add values for male and female
      items.forEach(item => {
        if (item.Sex === "Male") {
          obj.Male = item.Value || 0;
        } else if (item.Sex === "Female") {
          obj.Female = item.Value || 0;
        }
      });
      
      return obj;
    }).sort((a, b) => a.date - b.date);
  };
  
  const processAgeData = (data) => {
    if (!data || !Array.isArray(data)) return [];
    
    // Filter for unemployment rate data for Alberta
    const filteredData = data.filter(item => 
      item.GeoName === "Alberta" && 
      (item.Characteristic === "Unemployment rate" || item.Characteristics === "Unemployment rate")
    );
    
    // Group by date
    const groupedByDate = d3.group(filteredData, d => d.Date);
    
    // Convert to array of objects with date and age group values
    return Array.from(groupedByDate, ([dateStr, items]) => {
      const obj = { 
        date: new Date(dateStr), 
        formattedDate: formatDate(new Date(dateStr)) 
      };
      
      // Add each age group's value
      items.forEach(item => {
        if (item.Age) {
          obj[item.Age] = item.Value || 0;
        }
      });
      
      return obj;
    }).sort((a, b) => a.date - b.date);
  };
  
  const processCityData = (data) => {
    if (!data || !Array.isArray(data)) return [];
    
    // Find the latest date with data
    const datesWithData = data
      .filter(item => item.Value !== null)
      .map(item => new Date(item.Date));
    
    if (datesWithData.length === 0) return [];
    
    const latestDate = d3.max(datesWithData);
    
    if (!latestDate) return [];
    
    // Filter for latest date and cities (not Alberta)
    const latestData = data.filter(item => 
      new Date(item.Date).getTime() === latestDate.getTime() && 
      item.GeoName !== "Alberta" &&
      item.Value !== null
    );
    
    // Sort by unemployment rate (descending)
    return latestData.sort((a, b) => (b.Value || 0) - (a.Value || 0));
  };

  // Handle selection changes
  const handleProvinceSelection = (province) => {
    if (selectedProvinces.includes(province)) {
      setSelectedProvinces(selectedProvinces.filter(p => p !== province));
    } else {
      setSelectedProvinces([...selectedProvinces, province]);
    }
  };
  
  const handleIndustrySelection = (industry) => {
    if (selectedIndustries.includes(industry)) {
      setSelectedIndustries(selectedIndustries.filter(i => i !== industry));
    } else {
      setSelectedIndustries([...selectedIndustries, industry]);
    }
  };

  // Fetch data from API endpoints
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Load local JSON files instead of API calls
        const loadLocalFile = async (filename) => {
          try {
            const response = await fetch(`./data/${filename}.json`);
            const data = await response.json();
            console.log(`Loaded ${filename} data:`, data);
            // Handle both array and object formats
            return Array.isArray(data) ? data : [data];
          } catch (err) {
            console.error(`Error loading ${filename}.json:`, err);
            return [];
          }
        };
        
        // Load all data in parallel
        const [alberta, province, industry, sex, age, city] = await Promise.all([
          loadLocalFile('alberta'),
          loadLocalFile('province'),
          loadLocalFile('industry'),
          loadLocalFile('sex'),
          loadLocalFile('age'),
          loadLocalFile('city')
        ]);
        
        // Process and format data
        const processedAlbertaData = processAlbertaData(alberta);
        const processedProvinceData = processProvinceData(province);
        const processedIndustryData = processIndustryData(industry);
        const processedSexData = processSexData(sex);
        const processedAgeData = processAgeData(age);
        const processedCityData = processCityData(city);
        
        setAlbertaData(processedAlbertaData);
        setProvinceData(processedProvinceData);
        setIndustryData(processedIndustryData);
        setSexData(processedSexData);
        setAgeData(processedAgeData);
        setCityData(processedCityData);
        
        console.log("Processed data:", {
          alberta: processedAlbertaData,
          province: processedProvinceData,
          industry: processedIndustryData,
          sex: processedSexData,
          city: processedCityData
        });
        
        setLoading(false);
      } catch (err) {
        console.error("Data loading error:", err);
        setError("Failed to load data: " + err.message);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Update selected provinces with default values based on actual data
  useEffect(() => {
    if (provinceData && provinceData.length > 0) {
      const availableProvinces = getAvailableProvinces();
      console.log("Available provinces:", availableProvinces);
      
      // Set default selections based on available data
      const defaultProvinces = [];
      
      // Try to find common provinces
      const provinceOptions = [
        "Alberta", 
        "Canada",
        "British Columbia",
        "Ontario"
      ];
      
      // Add provinces that exist in the data
      provinceOptions.forEach(option => {
        if (availableProvinces.includes(option)) {
          defaultProvinces.push(option);
        }
      });
      
      // If we couldn't find any of the preferred options, use the first few available
      if (defaultProvinces.length === 0 && availableProvinces.length > 0) {
        defaultProvinces.push(availableProvinces[0]);
        if (availableProvinces.length > 1) {
          defaultProvinces.push(availableProvinces[1]);
        }
      }
      
      // Update state if we found valid selections
      if (defaultProvinces.length > 0) {
        setSelectedProvinces(defaultProvinces);
      }
    }
  }, [provinceData]);

  // Update selected industries with default values based on actual data
  useEffect(() => {
    if (industryData && industryData.length > 0) {
      const availableIndustries = getAvailableIndustries();
      console.log("Available industries:", availableIndustries);
      
      // Set default selections based on available data
      const defaultIndustries = [];
      
      // Try to find common industry categories
      const industryOptions = [
        "Total, all industries", 
        "Goods-producing sector",
        "Construction",
        "Manufacturing", 
        "Services-producing sector"
      ];
      
      // Add industries that exist in the data
      industryOptions.forEach(option => {
        if (availableIndustries.includes(option)) {
          defaultIndustries.push(option);
        }
      });
      
      // If we couldn't find any of the preferred options, use the first few available
      if (defaultIndustries.length === 0 && availableIndustries.length > 0) {
        defaultIndustries.push(availableIndustries[0]);
        if (availableIndustries.length > 1) {
          defaultIndustries.push(availableIndustries[1]);
        }
      }
      
      // Update state if we found valid selections
      if (defaultIndustries.length > 0) {
        setSelectedIndustries(defaultIndustries);
      }
    }
  }, [industryData]);
  
  // Dashboard components
  const renderAlbertaOverview = () => {
    const filteredData = filterByTimeframe(albertaData);
    if (!filteredData || filteredData.length === 0) return null;
    
    // Get current, min, max values
    const currentValue = filteredData[filteredData.length - 1].value;
    const minValue = d3.min(filteredData, d => d.value);
    const maxValue = d3.max(filteredData, d => d.value);
    
    // Calculate year-over-year change
    const currentDate = filteredData[filteredData.length - 1].date;
    const lastYearDate = new Date(currentDate);
    lastYearDate.setFullYear(lastYearDate.getFullYear() - 1);
    
    const lastYearValue = filteredData.find(d => 
      d.date.getFullYear() === lastYearDate.getFullYear() && 
      d.date.getMonth() === lastYearDate.getMonth()
    )?.value;
    
    const yoyChange = lastYearValue ? (currentValue - lastYearValue) : null;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500 mb-1">Current Unemployment Rate</div>
          <div className="text-2xl font-bold">{currentValue.toFixed(1)}%</div>
          {yoyChange !== null && (
            <div className={`text-sm ${yoyChange < 0 ? 'text-green-500' : 'text-red-500'}`}>
              {yoyChange.toFixed(1)}% from last year
            </div>
          )}
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500 mb-1">Lowest in Period</div>
          <div className="text-2xl font-bold">{minValue.toFixed(1)}%</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500 mb-1">Highest in Period</div>
          <div className="text-2xl font-bold">{maxValue.toFixed(1)}%</div>
        </div>
      </div>
    );
  };
  
  const renderAlbertaTrend = () => {
    const filteredData = filterByTimeframe(albertaData);
    if (!filteredData || filteredData.length === 0) return null;
    
    const chartData = filteredData.map(d => ({
      date: d.formattedDate,
      value: d.value
    }));
    
    return (
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="font-bold text-lg mb-2">Alberta Unemployment Rate Trend</div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => value.split('-')[0]}
                minTickGap={60}
              />
              <YAxis 
                domain={[0, 'auto']}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Unemployment Rate']} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={colorScale('Alberta')}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };
  
  const renderProvinceComparison = () => {
    const filteredData = filterByTimeframe(provinceData);
    if (!filteredData || filteredData.length === 0) return null;
    
    return (
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="font-bold text-lg mb-2">Provincial Comparison</div>
        <div className="flex flex-wrap gap-2 mt-2 mb-4">
          {getAvailableProvinces().map(province => (
            <div
              key={province}
              className={`px-3 py-1 rounded-full text-sm cursor-pointer ${
                selectedProvinces.includes(province) 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-500'
              }`}
              onClick={() => handleProvinceSelection(province)}
            >
              {province}
            </div>
          ))}
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="formattedDate" 
                tickFormatter={(value) => value.split('-')[0]}
                minTickGap={60}
              />
              <YAxis 
                domain={[0, 'auto']}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                formatter={(value) => [`${value.toFixed(1)}%`, 'Unemployment Rate']} 
                labelFormatter={(label) => label}
              />
              <Legend />
              {selectedProvinces.map(province => (
                <Line
                  key={province}
                  type="monotone"
                  dataKey={province}
                  name={province}
                  stroke={colorScale(province)}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };
  
  const renderIndustryComparison = () => {
    const filteredData = filterByTimeframe(industryData);
    if (!filteredData || filteredData.length === 0) return null;
    
    return (
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="font-bold text-lg mb-2">Industry Comparison</div>
        <div className="flex flex-wrap gap-2 mt-2 mb-4">
          {getAvailableIndustries().slice(0, 8).map(industry => (
            <div
              key={industry}
              className={`px-3 py-1 rounded-full text-sm cursor-pointer ${
                selectedIndustries.includes(industry) 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-500'
              }`}
              onClick={() => handleIndustrySelection(industry)}
            >
              {industry.length > 20 ? industry.substring(0, 20) + '...' : industry}
            </div>
          ))}
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="formattedDate" 
                tickFormatter={(value) => value.split('-')[0]}
                minTickGap={60}
              />
              <YAxis 
                domain={[0, 'auto']}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                formatter={(value) => [`${value.toFixed(1)}%`, 'Unemployment Rate']} 
                labelFormatter={(label) => label}
              />
              <Legend />
              {selectedIndustries.map(industry => (
                <Line
                  key={industry}
                  type="monotone"
                  dataKey={industry}
                  name={industry.length > 20 ? industry.substring(0, 20) + '...' : industry}
                  stroke={industryColorScale(industry)}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };
  
  const renderGenderComparison = () => {
    const filteredData = filterByTimeframe(sexData);
    if (!filteredData || filteredData.length === 0) return null;
    
    return (
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="font-bold text-lg mb-2">Gender Comparison</div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="formattedDate" 
                tickFormatter={(value) => value.split('-')[0]}
                minTickGap={60}
              />
              <YAxis 
                domain={[0, 'auto']}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                formatter={(value) => [`${value.toFixed(1)}%`, 'Unemployment Rate']} 
                labelFormatter={(label) => label}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="Male"
                name="Male"
                stroke={colorScale('Male')}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Female"
                name="Female"
                stroke={colorScale('Female')}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };
  
  const renderCityComparison = () => {
    if (!cityData || cityData.length === 0) return null;
    
    // Get top 5 cities by unemployment rate
    const topCities = cityData.slice(0, 5);
    
    // Format for bar chart
    const chartData = topCities.map(city => ({
      city: city.GeoName,
      value: city.Value || 0
    }));
    
    return (
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="font-bold text-lg mb-2">Cities with Highest Unemployment Rates</div>
        <div className="text-sm text-gray-500 mb-4">
          Latest data: {cityData.length > 0 ? new Date(cityData[0].Date).toLocaleDateString() : ''}
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                domain={[0, 'dataMax + 1']}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis 
                type="category" 
                dataKey="city" 
                tick={{ fontSize: 12 }}
              />
              <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Unemployment Rate']} />
              <Bar 
                dataKey="value" 
                fill="#4285F4"
                label={{ 
                  position: 'right', 
                  formatter: (value) => `${value.toFixed(1)}%`,
                  fill: '#000000'
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };
  
  // Main render
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="mb-4">Loading unemployment data...</div>
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-500">
          <div className="text-xl mb-2">Error</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Alberta Unemployment Dashboard</h1>
      
      <div className="mb-6">
        <div className="flex items-center space-x-4 flex-wrap">
          <div className="font-medium">Timeframe:</div>
          <div className="flex space-x-2 flex-wrap">
            {Object.keys(timeframes).map(tf => (
              <button
                key={tf}
                className={`px-3 py-1 rounded-md text-sm ${
                  selectedTimeframe === tf 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
                onClick={() => setSelectedTimeframe(tf)}
              >
                {tf === 'all' ? 'All data' : tf}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {renderAlbertaOverview()}
      
      <div className="mb-6 border-b">
        <div className="flex space-x-4">
          <button
            className={`pb-2 px-4 ${activeTab === 'trends' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
            onClick={() => setActiveTab('trends')}
          >
            Trends
          </button>
          <button
            className={`pb-2 px-4 ${activeTab === 'comparisons' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
            onClick={() => setActiveTab('comparisons')}
          >
            Comparisons
          </button>
        </div>
      </div>
      
      {activeTab === 'trends' && (
        <div className="space-y-6">
          {renderAlbertaTrend()}
          {renderProvinceComparison()}
          {renderIndustryComparison()}
        </div>
      )}
      
      {activeTab === 'comparisons' && (
        <div className="space-y-6">
          {renderGenderComparison()}
          {renderCityComparison()}
        </div>
      )}
      
      <div className="text-sm text-gray-500 mt-8">
        Data source: Alberta Economic Dashboard (api.economicdata.alberta.ca)
      </div>
    </div>
  );
};

export default Dashboard;
          