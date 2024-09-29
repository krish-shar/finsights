"use client";

import React from "react";
import Ticker, { FinancialTicker } from "nice-react-ticker";

export default function TickerComponent() {
  return (
    <div>
      <div className="ticker-wrapper">
        <Ticker slideSpeed={20}>
          <div className="h-18">
            <FinancialTicker
              id="1"
              change={true}
              symbol="S&P 500"
              lastPrice="5102.37"
              percentage="0.42%"
              currentPrice="21.32"
            />
            <FinancialTicker
              id="2"
              change={true}
              symbol="AAPL"
              lastPrice="189.73"
              percentage="0.85%"
              currentPrice="1.60"
            />
            <FinancialTicker
              id="3"
              change={true}
              symbol="GOOG"
              lastPrice="152.18"
              percentage="1.23%"
              currentPrice="1.85"
            />
            <FinancialTicker
              id="4"
              change={false}
              symbol="MSFT"
              lastPrice="412.65"
              percentage="-0.31%"
              currentPrice="-1.29"
            />
            <FinancialTicker
              id="5"
              change={true}
              symbol="AMZN"
              lastPrice="178.92"
              percentage="0.67%"
              currentPrice="1.19"
            />
            <FinancialTicker
              id="6"
              change={true}
              symbol="TSLA"
              lastPrice="267.48"
              percentage="2.15%"
              currentPrice="5.63"
            />
            <FinancialTicker
              id="7"
              change={true}
              symbol="NVDA"
              lastPrice="528.79"
              percentage="1.87%"
              currentPrice="9.71"
            />
            <FinancialTicker
              id="8"
              change={false}
              symbol="META"
              lastPrice="372.15"
              percentage="-0.22%"
              currentPrice="-0.82"
            />
            <FinancialTicker
              id="9"
              change={true}
              symbol="JPM"
              lastPrice="187.43"
              percentage="0.56%"
              currentPrice="1.04"
            />
            <FinancialTicker
              id="10"
              change={false}
              symbol="V"
              lastPrice="276.89"
              percentage="-0.18%"
              currentPrice="-0.50"
            />
            <FinancialTicker
              id="11"
              change={true}
              symbol="WMT"
              lastPrice="165.72"
              percentage="0.33%"
              currentPrice="0.54"
            />
            <FinancialTicker
              id="12"
              change={false}
              symbol="JNJ"
              lastPrice="158.36"
              percentage="-0.45%"
              currentPrice="-0.72"
            />
          </div>
        </Ticker>
      </div>
    </div>
  );
}
