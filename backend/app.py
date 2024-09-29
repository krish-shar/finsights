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
from functools import lru_cache
from dotenv import load_dotenv
load_dotenv()
import os
import cohere
import openai
import hnswlib
from concurrent.futures import ThreadPoolExecutor, as_completed

COHERE_API_KEY = os.getenv("COHERE_API_KEY")
PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")

co = cohere.Client(COHERE_API_KEY)
perclient = openai.OpenAI(api_key=PERPLEXITY_API_KEY, base_url="https://api.perplexity.ai")

app = Flask(__name__)
CORS(app)

embedded_stocks = []


@app.route('/top_thirteen_f', methods=['GET', 'POST'])
def top_thirteen_f():
    holdings = get_top_thirteen_f()
    return jsonify(holdings)

@lru_cache(maxsize=32)
@app.route('/earnings_report', methods=['GET', 'POST'])
def earnings_report():
    ticker = request.args.get('ticker')
    year = int(request.args.get('year'))
    quarter = int(request.args.get('quarter'))
    financials = get_earnings_report(ticker, year, quarter)
    return jsonify(financials)

@lru_cache(maxsize=32)
@app.route('/all_filings', methods=['GET', 'POST'])
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

@lru_cache(maxsize=32)
@app.route('/benzinga_news', methods=['GET', 'POST'])
def benzinga_news():
    tickers = request.args.get('tickers').split(',')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    news = get_benzinga_news(tickers, start_date, end_date)
    return jsonify(news)

@lru_cache(maxsize=32)
@app.route('/yahoo_news', methods=['GET', 'POST'])
def yahoo_news():
    ticker = request.args.get('ticker')
    news = get_yahoo_news(ticker)
    return jsonify(news)

@lru_cache(maxsize=32)
@app.route('/stock_data', methods=['GET', 'POST'])
def stock_data():
    ticker = request.args.get('ticker')
    end_date = dt.datetime.now().date()
    start_date = end_date - dt.timedelta(days=365*5)
    loaded_data = yf.download(tickers=ticker, start=start_date, end=end_date)
    
    # Convert the DataFrame to a dictionary with date strings as keys
    data_dict = loaded_data.reset_index().to_dict('records')
    formatted_data = [{
        'date': record['Date'].strftime('%Y-%m-%d'),
        'open': record['Open'],
        'high': record['High'],
        'low': record['Low'],
        'price': int(record['Close']*100)/100,
        'volume': record['Volume']
    } for record in data_dict]
    
    return jsonify(formatted_data)

class Vectorstore:
    def __init__(self, raw_documents):
        self.raw_documents = raw_documents
        self.docs = []
        self.docs_embs = []
        self.retrieve_top_k = 15
        self.rerank_top_k = 5
        self.load_and_chunk()
        self.embed()
        self.index()

    def load_and_chunk(self):
        def process_document(raw_document):
            # Process document logic here
            pass

        with ThreadPoolExecutor() as executor:
            future_to_doc = {executor.submit(process_document, doc): doc for doc in self.raw_documents}
            for future in as_completed(future_to_doc):
                self.docs.extend(future.result())

    def embed(self):
        co = cohere.Client(api_key="your_cohere_api_key")
        batch_size = 90
        for i in range(0, len(self.docs), batch_size):
            batch = self.docs[i:i + batch_size]
            texts = [doc["text"] for doc in batch]
            embeddings = co.embed(texts=texts, model="embed-english-v3.0").embeddings
            self.docs_embs.extend(embeddings)

    def index(self):
        dim = len(self.docs_embs[0])
        self.idx = hnswlib.Index(space='ip', dim=dim)
        self.idx.init_index(max_elements=len(self.docs_embs), ef_construction=200, M=16)
        self.idx.add_items(self.docs_embs)

    def retrieve(self, query):
        co = cohere.Client(api_key="your_cohere_api_key")
        query_emb = co.embed(texts=[query], model="embed-english-v3.0").embeddings[0]
        labels, distances = self.idx.knn_query(query_emb, k=self.retrieve_top_k)
        return [self.docs[i] for i in labels[0]]
    
vectorstore = Vectorstore([])
        
def ensure_stock_embedded(ticker, vectorstore):
    if ticker not in embedded_stocks:
        print(f"Embedding documents for {ticker}...")
        
        # Retrieve and embed new documents
        raw_documents = []
        raw_documents += get_all_filings(ticker)
        raw_documents += get_benzinga_news(ticker)
        raw_documents += get_yahoo_news(ticker)
        
        vectorstore.load_and_chunk(raw_documents)
        vectorstore.embed()
        vectorstore.index()
        
        # Add to the list of embedded stocks
        embedded_stocks.append(ticker)
    else:
        print(f"Documents for {ticker} are already embedded.")
        
ensure_stock_embedded("AAPL", vectorstore)
        
@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message')
    chat_history = data.get('chat_history', [])

    if not message:
        return jsonify({"error": "Message is required"}), 400

    print("Using perplexity to generate response...")

    # Generate search queries, if any
    response = co.chat(
        message=message,
        model="command-r-plus",
        search_queries_only=True,
        chat_history=chat_history
    )

    search_queries = []
    for query in response.search_queries:
        if len(query.text) >= 2 and len(query.text) <= 4 and query.text.isupper():
            ensure_stock_embedded(query.text, vectorstore)
        search_queries.append(query.text)

    messages = [
        {
            "role": "system",
            "content": (
                "You are an artificial intelligence assistant and you need to engage in a helpful, detailed, polite conversation with a user."
            ),
        },
        *chat_history,
        {
            "role": "user",
            "content": message,
        },
    ]

    # If there are search queries, retrieve the documents
    if search_queries:
        print("Retrieving information...", end="")
        documents = []
        for query in search_queries:
            documents.extend(vectorstore.retrieve(query))

        messages[1]["content"] += f" You may use the following information to generate a response but you should generate and use your own sources: {documents}"

    response = perclient.chat.completions.create(
        model="llama-3.1-sonar-large-128k-online",
        messages=messages
    )

    return jsonify({"response": response.choices[0].message})


if __name__ == '__main__':
    app.run(debug=True, port=8080)