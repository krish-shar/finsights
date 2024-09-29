"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSearchParams } from 'next/navigation';

function StockPage() {
  const [allStockData, setAllStockData] = useState([]);
  const [displayedData, setDisplayedData] = useState([]);
  const [timeRange, setTimeRange] = useState('1m');
  const [ticker, setTicker] = useState('');
  const searchParams = useSearchParams();

  const calculateDomain = (data) => {
    if (data.length === 0) return [0, 1]; // Default domain if no data
  
    const prices = data.map(item => item.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice;
    const buffer = range * 0.1; // 10% buffer
  
    return [Math.max(0, minPrice - buffer), maxPrice + buffer];
  };

  useEffect(() => {
    const tickerParam = searchParams.get('ticker');
    if (tickerParam) {
      setTicker(tickerParam.toUpperCase());
    }
  }, [searchParams]);

  useEffect(() => {
    if (ticker) {
      const fetchData = async () => {
        try {
          const response = await axios.get(`http://127.0.0.1:8080/stock_data?ticker=${ticker}`);
          console.log('Stock data:', response.data);
          setAllStockData(response.data);
          filterData(response.data, '1m');
        } catch (error) {
          console.error('Error fetching stock data:', error);
        }
      };

      fetchData();
    }
  }, [ticker]);

  const filterData = (data, range) => {
    const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
    let filteredData = [];

    switch (range) {
      case '5d':
        filteredData = sortedData.slice(0, 5);
        break;
      case '1m':
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        filteredData = sortedData.filter(item => new Date(item.date) >= oneMonthAgo);
        break;
      case '3m':
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        filteredData = sortedData.filter(item => new Date(item.date) >= threeMonthsAgo);
        break;
      case '6m':
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        filteredData = sortedData.filter(item => new Date(item.date) >= sixMonthsAgo);
        break;
      case '1y':
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        filteredData = sortedData.filter(item => new Date(item.date) >= oneYearAgo);
        break;
      case '5y':
        const fiveYearsAgo = new Date();
        fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
        filteredData = sortedData.filter(item => new Date(item.date) >= fiveYearsAgo);
        break;
      default:
        filteredData = sortedData;
    }

    setDisplayedData(filteredData.reverse());
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    filterData(allStockData, range);
  };

  const formatXAxis = (tickItem) => {
    const date = new Date(tickItem);
    switch (timeRange) {
      case '5d':
      case '1m':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case '3m':
      case '6m':
        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      case '1y':
      case '5y':
        return date.toLocaleDateString('en-US', { year: 'numeric' });
      default:
        return tickItem;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">{ticker} Stock Price</h1>
      <div className="w-full max-w-4xl h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={displayedData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxis}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={calculateDomain(displayedData)} 
              tickFormatter={(value) => value.toFixed(2)} 
            />
            <Tooltip 
  contentStyle={{ backgroundColor: '#333', borderRadius: '5px', color: '#fff', fontSize: '14px' }}
  labelStyle={{ color: '#ccc', fontSize: '12px' }}
/>
            <Legend />
            <Line 
  type="monotone" 
  dataKey="price" 
  stroke="#40E0D0"
  dot={false} 
/>
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 space-x-2">
        {['5d', '1m', '3m', '6m', '1y', '5y'].map((range) => (
          <button
            key={range}
            onClick={() => handleTimeRangeChange(range)}
            className={`px-4 py-2 rounded transition-all ${
              timeRange === range
                ? 'bg-accent-dark text-white'
                : 'bg-gray-400 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {range}
          </button>
        ))}
      </div>
    </div>
  );
}

export default StockPage;