from flask import Flask, request, jsonify
from flask_cors import CORS
from info_retriever import (
    get_top_thirteen_f,
    get_earnings_report,
    get_all_filings,
    get_benzinga_news,
    get_yahoo_news
)
import info_retriever as ir
import datetime as dt
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
import yfinance as yf
from functools import lru_cache
from dotenv import load_dotenv
load_dotenv()
import os
import cohere
import openai
import hnswlib
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Union
from tqdm import tqdm
from unstructured.partition.html import partition_html
from unstructured.chunking.title import chunk_by_title
# from sklearn.preprocessing import MinMaxScaler
# from keras.models import Sequential
# from keras.layers import Dense, LSTM

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
    def __init__(self, documents: List[Union[Dict[str, str], str]] = None):
        self.documents = documents or []
        self.docs = []
        self.docs_embs = []
        self.retrieve_top_k = 10
        self.rerank_top_k = 3
        self.idx = None
        
        if self.documents:
            self.process_documents()
            self.embed()
            self.index()

    def process_documents(self, new_documents: List[Union[Dict[str, str], str]] = None) -> List[Dict[str, str]]:
        """
        Processes documents, handling both URL-based and direct text input.
        """
        documents_to_process = new_documents or self.documents
        print("Processing documents...")
        
        def process_document(document):
            if isinstance(document, str):
                return [{"title": "Direct Text", "text": document, "url": None}]
            elif isinstance(document, dict) and "url" in document:
                try:
                    elements = partition_html(url=document["url"], headers={"User-Agent": "ks@gatech.edu"})
                    chunks = chunk_by_title(elements)
                    return [
                        {
                            "title": document.get("title", "Untitled"),
                            "text": str(chunk),
                            "url": document["url"],
                        }
                        for chunk in chunks
                    ]
                except Exception as e:
                    print(f"Error loading document: {e}")
                    return []
            else:
                print(f"Unsupported document format: {document}", end="\n")
                return []

        new_docs = []
        with ThreadPoolExecutor() as executor:
            future_to_doc = {executor.submit(process_document, doc): doc for doc in documents_to_process}
            
            for future in tqdm(as_completed(future_to_doc), total=len(documents_to_process), desc="Processing documents"):
                new_docs.extend(future.result())

        if new_documents:
            return new_docs
        else:
            self.docs = new_docs
            return []

    def embed(self, new_docs: List[Dict[str, str]] = None) -> List[List[float]]:
        """
        Embeds the document chunks using the Cohere API.
        """
        docs_to_embed = new_docs or self.docs
        print("Embedding document chunks...")

        batch_size = 90
        docs_len = len(docs_to_embed)
        new_embeddings = []
        
        for i in range(0, docs_len, batch_size):
            if i % 100 == 0:
                print(f"Processing document chunk {i} of {docs_len}...")
            batch = docs_to_embed[i : min(i + batch_size, docs_len)]
            texts = [item["text"] for item in batch]
            docs_embs_batch = co.embed(
                texts=texts, model="embed-english-v3.0", input_type="search_document"
            ).embeddings
            new_embeddings.extend(docs_embs_batch)
        
        if new_docs:
            return new_embeddings
        else:
            self.docs_embs = new_embeddings
            return []

    def index(self, new_embeddings: List[List[float]] = None) -> None:
        """
        Indexes the document chunks for efficient retrieval.
        """
        print("Indexing document chunks...")

        if self.idx is None:
            self.idx = hnswlib.Index(space="ip", dim=1024)
            self.idx.init_index(max_elements=len(self.docs_embs), ef_construction=512, M=64)
            self.idx.add_items(self.docs_embs, list(range(len(self.docs_embs))))
        elif new_embeddings:
            current_count = self.idx.get_current_count()
            self.idx.resize_index(current_count + len(new_embeddings))
            self.idx.add_items(new_embeddings, list(range(current_count, current_count + len(new_embeddings))))

        print(f"Indexing complete with {self.idx.get_current_count()} document chunks.")

    def add_documents(self, new_documents: List[Union[Dict[str, str], str]]) -> None:
        """
        Adds new documents to the existing Vectorstore.
        """
        new_docs = self.process_documents(new_documents)
        new_embeddings = self.embed(new_docs)
        self.index(new_embeddings)
        
        self.docs.extend(new_docs)
        self.docs_embs.extend(new_embeddings)
        self.documents.extend(new_documents)

    def retrieve(self, query: str) -> List[Dict[str, str]]:
        """
        Retrieves document chunks based on the given query.
        """
        query_emb = co.embed(
            texts=[query], model="embed-english-v3.0", input_type="search_query"
        ).embeddings
        
        doc_ids = self.idx.knn_query(query_emb, k=self.retrieve_top_k)[0][0]

        rank_fields = ["title", "text"]

        docs_to_rerank = [self.docs[doc_id] for doc_id in doc_ids]
        rerank_results = co.rerank(
            query=query,
            documents=docs_to_rerank,
            top_n=self.rerank_top_k,
            model="rerank-english-v3.0",
            rank_fields=rank_fields
        )

        doc_ids_reranked = [doc_ids[result.index] for result in rerank_results.results]

        docs_retrieved = []
        for doc_id in doc_ids_reranked:
            docs_retrieved.append(
                {
                    "title": self.docs[doc_id]["title"],
                    "text": self.docs[doc_id]["text"],
                    "url": self.docs[doc_id]["url"],
                }
            )

        return docs_retrieved

vectorstore = Vectorstore([{"title": "investopedia", "url": "https://www.investopedia.com/"}])
        
def ensure_stock_embedded(ticker, vectorstore: Vectorstore):
    if ticker not in embedded_stocks:
        print(f"Embedding documents for {ticker}...")
        
        # Retrieve and embed new documents
        raw_documents = []
        try:
            raw_documents += get_all_filings(ticker)
            raw_documents += get_benzinga_news(ticker)
            raw_documents += get_yahoo_news(ticker)

            vectorstore.add_documents(raw_documents)
            vectorstore.embed()
            vectorstore.index()
        except Exception as e:
            print(f"Error embedding documents for {ticker}: {e}")
            return
        
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
        preamble="You must make the first search query the ticker of the stock in question.",
        model="command-r-plus",
        search_queries_only=True,
        chat_history=chat_history
    )
    
    
    ticker = co.chat(
        model="command-r-plus",
        preamble="you are going to return only the ticker for the company that the user is asking about. The ticker should be formatted with MAX 4 characters and MIN 2 characters",
        message=message,
        connectors=[{"id": "web-search"}]
    )
    
    ensure_stock_embedded(ticker=ticker.text, vectorstore=vectorstore)
    print(f"Using perplexity to generate response for {ticker.text}...")
    

    search_queries = []
    for query in response.search_queries:
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
    print({"response": response.choices[0].message.content})
    return {"response": response.choices[0].message.content}

@app.route('/test_chat', methods=['POST'])
def test_chat():
    data = request.json
    message = data.get('message')
    return {"response": message}

# @app.route('/predict', methods=['GET', 'POST'])
# def predict():
#     ticker = request.args.get('ticker')
#     start_date = request.args.get('start_date')
#     end_date = request.args.get('end_date')
#     if start_date:
#         start = dt.datetime.strptime(start_date, '%Y-%m-%d')
#     else:
#         start = "2012-01-01"
#     if end_date:
#         end = dt.datetime.strptime(end_date, '%Y-%m-%d')
#     else: 
#         end = datetime.now()

#     df = yf.download(ticker, start=start, end=end)

#     # Create a new dataframe with only the 'Close column 
#     data = df.filter(['Close'])
#     # Convert the dataframe to a numpy array
#     dataset = data.values
#     # Get the number of rows to train the model on
#     training_data_len = int(np.ceil( len(dataset) * .95 ))

#     scaler = MinMaxScaler(feature_range=(0,1))
#     scaled_data = scaler.fit_transform(dataset)

#     # Create the training data set 
#     # Create the scaled training data set
#     train_data = scaled_data[0:int(training_data_len), :]
#     # Split the data into x_train and y_train data sets
#     x_train = []
#     y_train = []

#     for i in range(60, len(train_data)):
#         x_train.append(train_data[i-60:i, 0])
#         y_train.append(train_data[i, 0])
            
#     # Convert the x_train and y_train to numpy arrays 
#     x_train, y_train = np.array(x_train), np.array(y_train)

#     # Reshape the data
#     x_train = np.reshape(x_train, (x_train.shape[0], x_train.shape[1], 1))
#     # x_train.shape

#     # Build the LSTM model
#     model = Sequential()
#     model.add(LSTM(30, return_sequences=True, input_shape= (x_train.shape[1], 1)))
#     model.add(LSTM(30, return_sequences=False))
#     model.add(Dense(10))
#     model.add(Dense(1))

#     print("Begin Model Training...")

#     # Compile the model
#     model.compile(optimizer='adam', loss='mean_squared_error')

#     # Train the model
#     model.fit(x_train, y_train, batch_size=1, epochs=1)

#     # Create the testing data set
#     # Create a new array containing scaled values
#     test_data = scaled_data[training_data_len - 60: , :]
#     # Create the data sets x_test and y_test
#     x_test = []
#     y_test = dataset[training_data_len:, :]
#     for i in range(60, len(test_data)):
#         x_test.append(test_data[i-60:i, 0])
        
#     # Convert the data to a numpy array
#     x_test = np.array(x_test)

#     # Reshape the data
#     x_test = np.reshape(x_test, (x_test.shape[0], x_test.shape[1], 1 ))

#     # Get the models predicted price values 
#     predictions = model.predict(x_test)

#     # Undo the scaling 
#     scaled_predictions = scaler.inverse_transform(predictions)

#     # Get the root mean squared error (RMSE)
#     rmse = np.sqrt(np.mean(((scaled_predictions - y_test) ** 2)))
#     print("RMSE: " + str(rmse))

#     preds = predictions
#     future = np.array(preds[-60:])

#     ans = []
#     for i in range(0, 30):
#         input = future[-60:]
#         input = np.reshape(input, (1, 60, 1 ))
#         output = model.predict(input)

#         future = np.append(future, output)
#         ans.append(output)

#     ans = [scaler.inverse_transform(item) for item in ans]

#     start_date = datetime.now()

#     # Convert ans from a list of arrays into a flat list of predicted values
#     ans_flat = [item[0][0] for item in ans]  # Extract the predicted value from each array
#     print("ANS FLAT")
#     print(ans_flat)

#     # Generate a list of future dates starting from the start_date
#     future_dates = [start_date + timedelta(days=i) for i in range(len(ans_flat))]

#     # Create a DataFrame with the future dates and the predicted values
#     df_ans = pd.DataFrame({
#         'Date': future_dates,
#         'Predicted Value': ans_flat
#     })

#     print("DF ANS")
#     print(df_ans)

#     df_ans['Date'] = df_ans['Date'].dt.date

#     # Set the Date column as the index for the df_ans DataFrame
#     df_ans.set_index('Date', inplace=True)

#     # Plot the data
#     train = data[:training_data_len]
#     valid = data[training_data_len:]
#     valid['Predictions'] = scaled_predictions


#     # Filter the 'train' and 'valid' DataFrames to start from 2024
#     train_2024 = train.loc[train.index >= '2024-01-01']
#     valid_2024 = valid.loc[valid.index >= '2024-01-01']

#     # Plot the data
#     # plt.figure(figsize=(16,6))
#     # plt.title('Model')
#     # plt.xlabel('Date', fontsize=18)
#     # plt.ylabel('Close Price USD ($)', fontsize=18)

#     # Plot only the data starting from 2024
#     # plt.plot(train_2024['Close'], label='Train')
#     # plt.plot(valid_2024['Close'], label='Real Val')
#     # plt.plot(valid_2024['Predictions'], label='Predictions')

#     # Plot the predicted future values (df_ans should already contain 2024+ data)
#     # plt.plot(df_ans.index, df_ans['Predicted Value'], label='Predicted Value')

#     # Set x-axis limits to include both historical and predicted data
#     # plt.xlim(train_2024.index[0], df_ans.index[-1])

#     # Add a legend
#     # plt.legend(loc='lower right')
#     # plt.show()

#     # add to cache
#     # cache[(ticker, startParam, endParam)] = [valid_2024, df_ans]

#     print("Done!!")
#     return [valid_2024, df_ans]

if __name__ == '__main__':
    app.run(debug=True, port=8080)