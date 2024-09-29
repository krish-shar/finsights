const express = require('express')
const axios = require('axios')
const port = 8080
const app = express();
//9Z1SHZ24A9U3WWPC
//2MY1JSH3YDZ3LVOI
app.get('/:ticker', (req, res) => {
  let stockData;
    async function getData() {
        const {ticker} = req.params
        const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&apikey=9Z1SHZ24A9U3WWPC`;
        try {
          const response = await axios.get(url);
          if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
          }
          console.log(response)
          stockData = response.data['Time Series (Daily)'];
          console.log(stockData);
        } catch (error) {
          console.error(error.message);
        }
        res.json({
          data: stockData
        });
    }
      // Return the formatted stock data as JSON
    
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})