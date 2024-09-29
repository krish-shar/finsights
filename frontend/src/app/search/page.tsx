"use client"

import Image from "next/image";
import { CgProfile } from "react-icons/cg";
// const closes = ["186.27999877929688","191.0399932861328","189.99000549316406","194.35000610351562","207.14999389648438","214.2899932861328","213.25","221.5500030517578","227.57000732421875","224.17999267578125","217.49000549316406","218.36000061035156","213.30999755859375","224.72000122070312","224.52999877929688","229.7899932861328","220.82000732421875","222.5","228.1999969482422","227.7899932861328"]
// let Closes = []
// for (let i = 0; i < 20; i++) {
//     Closes.push(parseFloat(closes[i]))
// }
import { createChart } from 'lightweight-charts';
import React, { useEffect, useRef } from 'react';
import LineChart from './chart.jsx'

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen p-4">
      {/* Top Section */}
      <div className="flex justify-between items-center">
        {/* Profile Icon (Top Left) */}
        <button className="w-10 h-10 bg-gray-300 rounded-full">
            <CgProfile size={40}></CgProfile>
        </button>

        <div className="flex space-x-2">
          <input
            type="text"
            className="border rounded px-4 py-2 text-slate-950"
            placeholder="Search new ticker"
          />
          <button className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center">
            +
          </button>
        </div>
      </div>

      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-lg h-64">
            <LineChart></LineChart>
        </div>
      </div>
    
      <div className="w-full self-center">
        <input
          type="text"
          className="border rounded px-4 py-2 my-20 w-full"
          placeholder="New query"
        />
      </div>
    </div>
  );
}
