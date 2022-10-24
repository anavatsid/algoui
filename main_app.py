#!/usr/bin/env python3

from flask_restful import Api
from flask import Flask, render_template, make_response, request

import routes
import json
from process_ui import get_config_file_list
from notifier import web_port_num

app = Flask(__name__)
api = Api()
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024
routes.add_routes_to_resource(api)
api.init_app(app)


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/history')
def history():
    return render_template('history.html')


@app.route('/config')
def tick_config():
    import os.path
    response_data = {
            'status': 'fail',
            'message': ['invalid payload'],
        }
    res_data = {}
    is_parse = request.is_json
    print(request)
    if not is_parse:
        response_data["message"] = ['Failed to receive data.']
        response = json.dumps(response_data, indent=2)
        return response
    content = request.get_json()
    if content["command"] == "TICKERS":
        import os.path
        res_data = {}
        # this_path = os.path.dirname(os.path.abspath(__file__))
        # res_data["path"] = this_path
        ticker_file_list = get_config_file_list()
        # res_data["ticker_list"] = ticker_file_list
        # global_flag  = get_global_flag()
        # res_data["global_flag"] = global_flag
        response_data["message"] = [ticker_file_list]
        response_data["status"] = "success"

        response = json.dumps(response_data, indent=2)
        return response
    else:
        response = json.dumps(response_data, indent=2)
        return response


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=False, port=int(web_port_num))
