import math
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from keras.models import Sequential
from keras.layers import Dense, LSTM
import matplotlib.pyplot as plt
plt.style.use('seaborn-v0_8-deep')

import yfinance as yf

# For time stamps
from datetime import timedelta, datetime


cache = {}
def predict(ticker, startParam = None, endParam = None):
    if (startParam == None):
        start = "2012-01-01"
    else:
        start = startParam
    if (endParam == None):
        end = datetime.now()
    else:
        end = endParam


    if ((ticker, startParam, endParam) in cache):
        print("Entered Cache...")
        return cache[(ticker, startParam, endParam)]


    df = yf.download(ticker, start=start, end=end)

    # Create a new dataframe with only the 'Close column 
    data = df.filter(['Close'])
    # Convert the dataframe to a numpy array
    dataset = data.values
    # Get the number of rows to train the model on
    training_data_len = int(np.ceil( len(dataset) * .95 ))

    scaler = MinMaxScaler(feature_range=(0,1))
    scaled_data = scaler.fit_transform(dataset)

    # Create the training data set 
    # Create the scaled training data set
    train_data = scaled_data[0:int(training_data_len), :]
    # Split the data into x_train and y_train data sets
    x_train = []
    y_train = []

    for i in range(60, len(train_data)):
        x_train.append(train_data[i-60:i, 0])
        y_train.append(train_data[i, 0])
            
    # Convert the x_train and y_train to numpy arrays 
    x_train, y_train = np.array(x_train), np.array(y_train)

    # Reshape the data
    x_train = np.reshape(x_train, (x_train.shape[0], x_train.shape[1], 1))
    # x_train.shape

    # Build the LSTM model
    model = Sequential()
    model.add(LSTM(30, return_sequences=True, input_shape= (x_train.shape[1], 1)))
    model.add(LSTM(30, return_sequences=False))
    model.add(Dense(10))
    model.add(Dense(1))

    print("Begin Model Training...")

    # Compile the model
    model.compile(optimizer='adam', loss='mean_squared_error')

    # Train the model
    model.fit(x_train, y_train, batch_size=1, epochs=1)

    # Create the testing data set
    # Create a new array containing scaled values
    test_data = scaled_data[training_data_len - 60: , :]
    # Create the data sets x_test and y_test
    x_test = []
    y_test = dataset[training_data_len:, :]
    for i in range(60, len(test_data)):
        x_test.append(test_data[i-60:i, 0])
        
    # Convert the data to a numpy array
    x_test = np.array(x_test)

    # Reshape the data
    x_test = np.reshape(x_test, (x_test.shape[0], x_test.shape[1], 1 ))

    # Get the models predicted price values 
    predictions = model.predict(x_test)

    # Undo the scaling 
    scaled_predictions = scaler.inverse_transform(predictions)

    # Get the root mean squared error (RMSE)
    rmse = np.sqrt(np.mean(((scaled_predictions - y_test) ** 2)))
    print("RMSE: " + str(rmse))

    preds = predictions
    future = np.array(preds[-60:])

    ans = []
    for i in range(0, 30):
        input = future[-60:]
        input = np.reshape(input, (1, 60, 1 ))
        output = model.predict(input)

        future = np.append(future, output)
        ans.append(output)

    ans = [scaler.inverse_transform(item) for item in ans]

    start_date = datetime.now()

    # Convert ans from a list of arrays into a flat list of predicted values
    ans_flat = [item[0][0] for item in ans]  # Extract the predicted value from each array
    print("ANS FLAT")
    print(ans_flat)

    # Generate a list of future dates starting from the start_date
    future_dates = [start_date + timedelta(days=i) for i in range(len(ans_flat))]

    # Create a DataFrame with the future dates and the predicted values
    df_ans = pd.DataFrame({
        'Date': future_dates,
        'Predicted Value': ans_flat
    })

    print("DF ANS")
    print(df_ans)

    df_ans['Date'] = df_ans['Date'].dt.date

    # Set the Date column as the index for the df_ans DataFrame
    df_ans.set_index('Date', inplace=True)

    # Plot the data
    train = data[:training_data_len]
    valid = data[training_data_len:]
    valid['Predictions'] = scaled_predictions


    # Filter the 'train' and 'valid' DataFrames to start from 2024
    train_2024 = train.loc[train.index >= '2024-01-01']
    valid_2024 = valid.loc[valid.index >= '2024-01-01']

    # Plot the data
    plt.figure(figsize=(16,6))
    plt.title('Model')
    plt.xlabel('Date', fontsize=18)
    plt.ylabel('Close Price USD ($)', fontsize=18)

    # Plot only the data starting from 2024
    plt.plot(train_2024['Close'], label='Train')
    plt.plot(valid_2024['Close'], label='Real Val')
    plt.plot(valid_2024['Predictions'], label='Predictions')

    # Plot the predicted future values (df_ans should already contain 2024+ data)
    plt.plot(df_ans.index, df_ans['Predicted Value'], label='Predicted Value')

    # Set x-axis limits to include both historical and predicted data
    plt.xlim(train_2024.index[0], df_ans.index[-1])

    # Add a legend
    plt.legend(loc='lower right')
    plt.show()

    # add to cache
    cache[(ticker, startParam, endParam)] = [valid_2024, df_ans]

    print("Done!!")
    return [valid_2024, df_ans]


# print(predict("AAPL"))
# print(predict("AAPL"))