// components/LineChart.js
import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';


const LineChart = ({ ticker }) => {
  const chartRef = useRef(null);
//   const [loading, setLoading] = useState(true); // Loading state
//   const [error, setError] = useState(null); // Error state
//   const [stockData, setStockData] = useState([]); // State for the stock data

//   const fetchStockData = async (ticker) => {
//     const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&apikey=${ALPHA_VANTAGE_API_KEY}`;

//     try {
//       const response = await axios.get(url);
//       const timeSeries = response.data['Time Series (Daily)'];

//       if (!timeSeries) {
//         throw new Error('Invalid stock ticker or no data available.');
//       }

//       // Process the data into the format for ECharts (x-axis: dates, y-axis: prices)
//       const formattedData = Object.keys(timeSeries).map((date) => ({
//         date,
//         close: parseFloat(timeSeries[date]['4. close']),
//       }));

//       // Sort the data by date (ascending)
//       formattedData.reverse();

//       setStockData(formattedData); // Set the stock data
//       setLoading(false); // Set loading to false when data is fetched
//     } catch (error) {
//       console.error('Error fetching stock data:', error);
//       setError('Failed to fetch stock data');
//       setLoading(false);
//     }
//   };
   
  useEffect(() => {
    const chartInstance = echarts.init(chartRef.current);

    // Set chart options
    const options = {
      title: {
        text: ticker + ' Market Summary',
      },
      tooltip: {
        trigger: 'axis',
      },
      xAxis: {
        type: 'category',
        data: ['2023-09-21', '2023-09-22', '2023-09-23', '2023-09-24', '2023-09-25'],
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          data: [80, 82, 81, 83, 85],
          type: 'line',
          smooth: true,
        },
      ],
    };

    // Set the chart options
    chartInstance.setOption(options);

    // Clean up the chart on component unmount
    return () => {
      chartInstance.dispose();
    };
  }, []);

  return <div ref={chartRef} className="w-full h-full" />;
};

export default LineChart;



// import { createChart, ColorType } from 'lightweight-charts';
// import React, { useEffect, useRef } from 'react';

// export const ChartComponent = props => {
//     const chart = createChart(document.body, { width: 400, height: 300 });
//     const lineSeries = chart.addLineSeries();
//     lineSeries.setData([
//         { time: '2019-04-11', value: 80.01 },
//         { time: '2019-04-12', value: 96.63 },
//         { time: '2019-04-13', value: 76.64 },
//         { time: '2019-04-14', value: 81.89 },
//         { time: '2019-04-15', value: 74.43 },
//         { time: '2019-04-16', value: 80.01 },
//         { time: '2019-04-17', value: 96.63 },
//         { time: '2019-04-18', value: 76.64 },
//         { time: '2019-04-19', value: 81.89 },
//         { time: '2019-04-20', value: 74.43 },
//     ]);
// }

// export const ChartComponent = props => {
//     const {
//         data,
//         colors: {
//             backgroundColor = 'white',
//             lineColor = '#2962FF',
//             textColor = 'black',
//             areaTopColor = '#2962FF',
//             areaBottomColor = 'rgba(41, 98, 255, 0.28)',
//         } = {},
//     } = props;

//     const chartContainerRef = useRef();

//     useEffect(
//         () => {
//             const handleResize = () => {
//                 chart.applyOptions({ width: chartContainerRef.current.clientWidth });
//             };

//             const chart = createChart(chartContainerRef.current, {
//                 layout: {
//                     background: { type: ColorType.Solid, color: backgroundColor },
//                     textColor,
//                 },
//                 width: chartContainerRef.current.clientWidth,
//                 height: 300,
//             });
//             chart.timeScale().fitContent();

//             const newSeries = chart.addAreaSeries({ lineColor, topColor: areaTopColor, bottomColor: areaBottomColor });
//             newSeries.setData(data);

//             window.addEventListener('resize', handleResize);

//             return () => {
//                 window.removeEventListener('resize', handleResize);

//                 chart.remove();
//             };
//         },
//         [data, backgroundColor, lineColor, textColor, areaTopColor, areaBottomColor]
//     );

//     return (
//         <div
//             ref={chartContainerRef}
//         />
//     );
// };
// let vals = ["186.27999877929688","191.0399932861328","189.99000549316406","194.35000610351562","207.14999389648438","214.2899932861328","213.25","221.5500030517578","227.57000732421875","224.17999267578125","217.49000549316406","218.36000061035156","213.30999755859375","224.72000122070312","224.52999877929688","229.7899932861328","220.82000732421875","222.5","228.1999969482422","227.7899932861328"]

// const initialData = [
//     { time: '2018-12-22', value: 32.51 },
//     { time: '2018-12-23', value: 31.11 },
//     { time: '2018-12-24', value: 27.02 },
//     { time: '2018-12-25', value: 27.32 },
//     { time: '2018-12-26', value: 25.17 },
//     { time: '2018-12-27', value: 28.89 },
//     { time: '2018-12-28', value: 25.46 },
//     { time: '2018-12-29', value: 23.92 },
//     { time: '2018-12-30', value: 22.68 },
//     { time: '2018-12-31', value: 22.67 },
// ];


// export function Chart(props) {
//     return (
//         <div>
//             <p2>Hello</p2>
//         <ChartComponent {...props} data={initialData}></ChartComponent>
//         </div>
//     );
// }