"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useSearchParams } from "next/navigation";

function PredictionGraph() {
  const [displayedData, setDisplayedData] = useState([]);
  const [ticker, setTicker] = useState("");
  const searchParams = useSearchParams();

  // Hard-coded data based on the provided pandas DataFrame structure
  const historicalData = [
    { Date: "2024-02-09", Close: 188.850006, Predictions: 181.900558 },
    { Date: "2024-02-12", Close: 187.149994, Predictions: 181.967896 },
    { Date: "2024-02-13", Close: 185.039993, Predictions: 181.905396 },
    { Date: "2024-02-14", Close: 184.149994, Predictions: 181.587921 },
    { Date: "2024-02-15", Close: 183.860001, Predictions: 181.088654 },
    // ... (add more data points as needed)
    { Date: "2024-09-27", Close: 227.789993, Predictions: 214.518234 },
  ];

  const futureData = [
    { Date: "2024-09-29", "Predicted Value": 202.991653 },
    { Date: "2024-09-30", "Predicted Value": 202.355179 },
    { Date: "2024-10-01", "Predicted Value": 201.200714 },
    // ... (add more data points as needed)
    { Date: "2024-10-28", "Predicted Value": 167.482254 },
  ];

  const calculateDomain = (data) => {
    if (data.length === 0) return [0, 1];

    const allValues = data.flatMap((item) =>
      [item.Close, item.Predictions, item["Predicted Value"]].filter(Boolean)
    );

    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    const range = maxValue - minValue;
    const buffer = range * 0.1;

    return [Math.max(0, minValue - buffer), maxValue + buffer];
  };

  useEffect(() => {
    const tickerParam = searchParams.get("ticker");
    if (tickerParam) {
      setTicker(tickerParam.toUpperCase());
    }
  }, [searchParams]);

  useEffect(() => {
    if (ticker) {
      const combinedData = [
        ...historicalData.map((item) => ({
          ...item,
          Date: new Date(item.Date),
        })),
        ...futureData.map((item) => ({
          Date: new Date(item.Date),
          "Predicted Value": item["Predicted Value"],
        })),
      ].sort((a, b) => a.Date - b.Date);

      setDisplayedData(combinedData);
    }
  }, [ticker]);

  const formatXAxis = (tickItem) => {
    const date = new Date(tickItem);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
              dataKey="Date"
              tickFormatter={formatXAxis}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={calculateDomain(displayedData)}
              tickFormatter={(value) => value.toFixed(2)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#333",
                borderRadius: "5px",
                color: "#fff",
                fontSize: "14px",
              }}
              labelStyle={{ color: "#ccc", fontSize: "12px" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="Close"
              stroke="#40E0D0"
              dot={false}
              name="Real Close"
              strokeWidth="4"
            />
            <Line
              type="monotone"
              dataKey="Predictions"
              stroke="#FF6347"
              dot={false}
              name="Predicted Close"
              strokeWidth="4"
            />
            <Line
              type="monotone"
              dataKey="Predicted Value"
              stroke="#FFAA22"
              dot={false}
              name="Future Prediction"
              strokeWidth="4"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default PredictionGraph;
