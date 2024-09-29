from flask import Flask, request, jsonify
from flask_cors import CORS
from info_retriever import (
    get_top_thirteen_f,
    get_earnings_report,
    get_all_filings,
    get_benzinga_news,
    get_yahoo_news
)
import datetime as dt
import yfinance as yf

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

app = Flask(__name__)

@app.route('/top_thirteen_f', methods=['GET'])
def top_thirteen_f():
    holdings = get_top_thirteen_f()
    return jsonify(holdings)

@app.route('/earnings_report', methods=['GET'])
def earnings_report():
    ticker = request.args.get('ticker')
    year = int(request.args.get('year'))
    quarter = int(request.args.get('quarter'))
    financials = get_earnings_report(ticker, year, quarter)
    return jsonify(financials)

@app.route('/all_filings', methods=['GET'])
def all_filings():
    ticker = request.args.get('ticker')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    if start_date:
        start_date = dt.datetime.strptime(start_date, '%Y-%m-%d')
    if end_date:
        end_date = dt.datetime.strptime(end_date, '%Y-%m-%d')
    filings = get_all_filings(ticker, start_date, end_date)
    return jsonify(filings)

@app.route('/benzinga_news', methods=['GET'])
def benzinga_news():
    tickers = request.args.get('tickers').split(',')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    news = get_benzinga_news(tickers, start_date, end_date)
    return jsonify(news)

@app.route('/yahoo_news', methods=['GET'])
def yahoo_news():
    ticker = request.args.get('ticker')
    news = get_yahoo_news(ticker)
    return jsonify(news)

@app.route('/stock_data', methods=['GET'])
def stock_data():
    ticker = request.args.get('ticker')
    # end date = today
    end_date = dt.datetime.now().date()
    # start date = 5 years ago
    start_date = end_date - dt.timedelta(days=365*5)
    loaded_data = yf.download(tickers=ticker, start=start_date, end=end_date)
    return loaded_data.to_json()


if __name__ == '__main__':
    app.run(debug=True, port=8080)