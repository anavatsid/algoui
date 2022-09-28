# LS Detection from Stock Graph

## Install dependencies
    python-dotenv
    requests
    pandas
    ibapi
    flask
    flask-restful
`python-dotenv` is for **_slack-notification_**. For slack-notification, please create `.env` file.


### UI Manual 
```
python main_app.py
```
After run, go to http://localhost:8088/.
By using combobox, please select the target Ticker config file. 
Type the quantity of order in _**QUANTITY**_ box and click _**FLATTEN**_, **_REVERSE_**, **_BUY_**, **_SELL_** button and place order action. 
In order to view the history of order placement, click _**HISTORY**_.