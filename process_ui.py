import json
import os
from datetime import datetime

from flask import make_response, request
from flask_restful import Resource
import configparser
from order_utils.create_order import get_cfg
from log_utils import export_log, read_meta
from trade import process_trade, read_positions


log_folder = "log"
os.makedirs(log_folder, exist_ok=True)
# from main import *
trade_config_dir = "order_utils/cfg"
os.makedirs(trade_config_dir, exist_ok=True)
global_trade_file = "order_utils/TRADE_FLAG.cfg"


def get_config_file_list():

    files = [file for file in os.listdir(trade_config_dir) if file.endswith(".cfg")]
    print(files)
    return files


def get_global_flag():
    if os.path.exists(global_trade_file):
        try:
            config = configparser.ConfigParser()
            config.read([global_trade_file])
            return config.getboolean("global", "global")
        except:
            return False
    else:
        print("Global Trade File not exists.")
        return False


def change_global(flag):
    config = configparser.ConfigParser()
    config["global"] = {
        "global": flag
    }
    with open(global_trade_file, "w") as cfg:
        config.write(cfg)


class MainReceiver(Resource):
    def __init__(self):
        self.response_data = {
            'status': 'fail',
            'message': ['invalid payload'],
        }

    def post(self):
        is_parse = request.is_json
        if not is_parse:
            self.response_data["message"] = ['Failed to receive data.']
            response = json.dumps(self.response_data, indent=2)
            return make_response(response, 200)

        content = request.get_json()
        try:
            command = content['command']
        except Exception as error:
            self.response_data["message"] = [repr(error)]
            response = json.dumps(self.response_data, indent=2)
            return make_response(response, 200)

        if command == 'MANUAL_ORDER':
            data = content['message']
            action_type = data["action"]
            cfg_file = os.path.join(trade_config_dir, data["ticker"])
            if not os.path.exists(cfg_file):
                res_data = ["Config File not Exists."]
            else:
                original_config_dict = {}
                print("original_config_dict=", original_config_dict)
                try:
                    original_config_dict = get_cfg(cfg_file)
                except:
                    res_data = ["Invalid Config File."]
                    # print(original_config_dict)
                if original_config_dict != {}:
                    try:
                        cfg_dict = {
                            "contract": {},
                            "order": {
                                "action": action_type,
                                "position": int(data["position"]),
                                "quantity": int(data["order_qty"])
                            }
                        }
                        print(cfg_dict)
                        ticker_name = original_config_dict["contract"]["symbol"]
                        log_file = ticker_name + "_" + datetime.now().strftime("%m_%d_%Y") + ".log"
                        log_path = os.path.join(log_folder, log_file)

                        response_data = process_trade(cfg_dict, cfg_file)
                        if response_data["success"]:
                            tm_msg = response_data["description"]
                            slack_msg = response_data["slack_msg"]
                            export_log(tm_msg, log_path, slack_msg, True)
                            self.response_data["status"] = "success"
                            cur_pos = response_data["current_pos"]
                            res_data = ["{} Order Placed Successfully.".format(action_type), cur_pos]
                        else:
                            slack_msg = response_data["slack_msg"]
                            tm_msg = response_data["description"]
                            export_log(tm_msg, log_path)
                            res_data = ["{} Order: {}".format(action_type, tm_msg.split("\t")[-1])]
                    except Exception as err:
                        print(repr(err))
                        res_data = ["Failed to place order."]
        
        #
        # elif command == 'BUY':
        #     data = content['message']
        #     cfg_file = os.path.join(trade_config_dir, data["ticker"])
        #     if not os.path.exists(cfg_file):
        #         res_data = ["Config File not Exists."]
        #     else:
        #         original_config_dict = {}
        #         try:
        #             original_config_dict = get_cfg(cfg_file)
        #         except:
        #             res_data = ["Invalid Config File."]
                    
        #         print("original_config_dict=", original_config_dict)

        #             # print(original_config_dict)
        #         if original_config_dict != {}:
        #             try:
        #                 cfg_dict = {
        #                     "contract": {},
        #                     "order": {
        #                         "action": command,
        #                         "position": int(data["position"]),
        #                         "quantity": int(data["order_qty"])
        #                     }
        #                 }
        #                 ticker_name = original_config_dict["contract"]["symbol"]
        #                 log_file = ticker_name + "_" + datetime.now().strftime("%m_%d_%Y") + ".log"
        #                 log_path = os.path.join(log_folder, log_file)

        #                 response_data = process_trade(cfg_dict, cfg_file)
        #                 if response_data["success"]:
        #                     tm_msg = response_data["description"]
        #                     slack_msg = response_data["slack_msg"]
        #                     export_log(tm_msg, log_path, slack_msg, True)
        #                     self.response_data["status"] = "success"
        #                     cur_pos = response_data["current_pos"]
        #                     res_data = ["{} Order Placed Successfully.".format(command), cur_pos]
        #                 else:
        #                     tm_msg = response_data["description"]
        #                     export_log(tm_msg, log_path)
        #                     res_data = ["{} Order: {}".format(command, tm_msg.split("\t")[-1])]
        #             except:
        #                 res_data = ["Failed to place order."]

        # elif command == 'SELL':
        #     data = content['message']
        #     cfg_file = os.path.join(trade_config_dir, data["ticker"])
        #     if not os.path.exists(cfg_file):
        #         res_data = ["Config File not Exists."]
        #     else:
        #         original_config_dict = {}
        #         try:
        #             original_config_dict = get_cfg(cfg_file)
        #             print("original_config_dict=", original_config_dict)

        #         except:
        #             res_data = ["Invalid Config File."]
        #             # print(original_config_dict)
        #         if original_config_dict != {}:
        #             try:
        #                 cfg_dict = {
        #                     "contract": {},
        #                     "order": {
        #                         "action": command,
        #                         "position": int(data["position"]),
        #                         "quantity": int(data["order_qty"])
        #                     }
        #                 }
        #                 ticker_name = original_config_dict["contract"]["symbol"]
        #                 log_file = ticker_name + "_" + datetime.now().strftime("%m_%d_%Y") + ".log"
        #                 log_path = os.path.join(log_folder, log_file)

        #                 response_data = process_trade(cfg_dict, cfg_file)
        #                 if response_data["success"]:
        #                     tm_msg = response_data["description"]
        #                     slack_msg = response_data["slack_msg"]
        #                     export_log(tm_msg, log_path, slack_msg, True)
        #                     self.response_data["status"] = "success"
        #                     cur_pos = response_data["current_pos"]
        #                     res_data = ["{} Order Placed Successfully.".format(command), cur_pos]
        #                 else:
        #                     tm_msg = response_data["description"]
        #                     export_log(tm_msg, log_path)
        #                     res_data = ["{} Order: {}".format(command, tm_msg.split("\t")[-1])]
        #             except:
        #                 res_data = ["Failed to place order."]

        # elif command == 'FLATTEN':
        #     data = content['message']
        #     cfg_file = os.path.join(trade_config_dir, data["ticker"])
        #     if not os.path.exists(cfg_file):
        #         res_data = ["Config File not Exists."]
        #     else:
        #         original_config_dict = {}
        #         try:
        #             original_config_dict = get_cfg(cfg_file)
        #         except:
        #             res_data = ["Invalid Config File."]
        #             # print(original_config_dict)
        #         if original_config_dict != {}:
        #             try:
        #                 cfg_dict = {
        #                     "contract": {},
        #                     "order": {
        #                         "action": command,
        #                         "position": int(data["position"]),
        #                         "quantity": int(data["order_qty"])
        #                     }
        #                 }
        #                 # print(cfg_dict)
        #                 ticker_name = original_config_dict["contract"]["symbol"]
        #                 log_file = ticker_name + "_" + datetime.now().strftime("%m_%d_%Y") + ".log"
        #                 log_path = os.path.join(log_folder, log_file)

        #                 response_data = process_trade(cfg_dict, cfg_file)
        #                 if response_data["success"]:
        #                     tm_msg = response_data["description"]
        #                     slack_msg = response_data["slack_msg"]
        #                     export_log(tm_msg, log_path, slack_msg, True)
        #                     self.response_data["status"] = "success"
        #                     cur_pos = response_data["current_pos"]
        #                     res_data = ["{} Order Placed Successfully.".format(command), cur_pos]
        #                 else:
        #                     tm_msg = response_data["description"]
        #                     export_log(tm_msg, log_path)
        #                     res_data = ["{} Order: {}".format(command, tm_msg.split("\t")[-1])]
        #             except Exception as err:
        #                 print(repr(err))
        #                 res_data = ["Failed to place order."]

        #

        elif command == 'INITIALIZE':
            data = content['message']
            ticker_list = get_config_file_list()
            # print(ticker_list)
            ticker_postion_info = {}
            postion_info = read_positions()
            for tick in ticker_list:
                tick_name = get_cfg(os.path.join(trade_config_dir, tick))["contract"]["symbol"]
                try:
                    ticker_postion = postion_info.Quantity[postion_info["Symbol"] == tick_name].tolist()[0]
                    if ticker_postion == "":
                        ticker_postion = 0
                    else:
                        ticker_postion = int(ticker_postion)
                    # print(f"{target_pos=}")
                except:
                    ticker_postion = 0
                ticker_postion_info[tick] = {
                    "symbol": tick_name,
                    "position": ticker_postion
                }

            global_enabled = get_global_flag()
            res_data = [ticker_list, ticker_postion_info, global_enabled]
            # print(res_data)
            self.response_data["status"] = "success"

        elif command == 'GLOBAL_CHANGED':
            data = content['message']
            flag = data["global_flag"]
            try:
                change_global(flag)
                res_data = ["Current Status: {}".format("Enable" if flag else "Disable")]
                self.response_data["status"] = "success"
            except:
                res_data = ["Failed to change."]
                # self.response_data["status"] = "success"
        elif command == 'TICKER_CHANGED':
            data = content['message']
            new_ticker = data["ticker_name"]
            cfg_data = get_cfg(os.path.join(trade_config_dir, new_ticker))
            ticker_name = cfg_data["contract"]["symbol"]
            current_positions = read_positions()
            print(current_positions)
            if len(current_positions) != 0:
                try:
                    ticker_postion = current_positions.Quantity[current_positions["Symbol"] == ticker_name].tolist()[0]
                    if ticker_postion == "":
                        ticker_postion = 0
                    else:
                        ticker_postion = int(ticker_postion)
                    # print(f"{target_pos=}")
                except:
                    ticker_postion = 0
            else:
                ticker_postion = 0
            res_data = [new_ticker, ticker_postion]
            # print(res_data)
            self.response_data["status"] = "success"
        elif command == "HISTORY":
            data = content["message"]
            table = read_meta()
            # print(table)
            res_data = [table]
            self.response_data["status"] = "success"
        else:
            res_data = ["Invalid operation."]

        self.response_data["message"] = res_data
        response = json.dumps(self.response_data, indent=2)
        return make_response(response, 200)


class AutoOrder(Resource):
    def __init__(self):
        self.response_data = {
            'status': 'fail',
            'message': ['invalid payload'],
        }

    def post(self):
        is_parse = request.is_json
        if not is_parse:
            self.response_data["message"] = ['Failed to receive data.']
            response = json.dumps(self.response_data, indent=2)
            return make_response(response, 200)

        content = request.get_json()
        try:
            command = content['command']
        except Exception as error:
            self.response_data["message"] = [repr(error)]
            response = json.dumps(self.response_data, indent=2)
            return make_response(response, 200)
        
        if command == 'PLACE_ORDER':
            data = content['message']
            cfg_file = os.path.join(trade_config_dir, data["ticker"])
            signal = data["signal"]
            if not os.path.exists(cfg_file):
                res_data = ["Config File not Exists."]
            else:
                original_config_dict = {}
                try:
                    original_config_dict = get_cfg(cfg_file)
                except:
                    res_data = ["Invalid Config File."]
                    
                print("original_config_dict=", original_config_dict)

                if original_config_dict != {}:
                    try:
                        if signal == "L":
                            action = "BUY"
                        else:
                            action = "SELL"
                        cfg_dict = {
                            "contract": {},
                            "order": {
                                "action": action,                                
                            }
                        }
                        ticker_name = original_config_dict["contract"]["symbol"]
                        log_file = ticker_name + "_" + datetime.now().strftime("%m_%d_%Y") + ".log"
                        log_path = os.path.join(log_folder, log_file)
                        
                        if get_global_flag():
                            response_data = process_trade(cfg_dict, cfg_file, is_auto=True)
                            if response_data["success"]:
                                tm_msg = response_data["description"]
                                slack_msg = response_data["slack_msg"]
                                export_log(tm_msg, log_path, slack_msg, True)
                                self.response_data["status"] = "success"
                                cur_pos = response_data["current_pos"]
                                # res_data = ["{} Order Placed Successfully.".format(command), cur_pos]
                                res_data = [tm_msg]
                            else:
                                tm_msg = response_data["description"]
                                export_log(tm_msg, log_path)
                                # res_data = ["{} Order: {}".format(command, tm_msg.split("\t")[-1])]
                                res_data = [tm_msg]
                        else:
                            res_data = ["The Current Auto Trade Status is Disabled."]

                    except Exception as err:
                        res_data = ["Failed to place order: {}".format(repr(err))]
        elif command == 'EXPORT_LOG':
            data = content['message']
            print(data["is_notified"])

            cfg_file = os.path.join(trade_config_dir, data["config_file"])
            if not os.path.exists(cfg_file):
                res_data = ["Config File not Exists."]
            else:
                original_config_dict = {}
                try:
                    original_config_dict = get_cfg(cfg_file)
                    ticker_name = original_config_dict["contract"]["symbol"]
                    log_file = ticker_name + "_" + datetime.now().strftime("%m_%d_%Y") + ".log"
                    log_path = os.path.join(log_folder, log_file)
                    export_log(data["message"], log_path, is_notified=data["is_notified"])
                    res_data = ["Successfully saved log messages"]
                    self.response_data["status"] = "success"
                except:
                    res_data = ["Invalid Config File."]

        else:
            res_data = ["Invalid operation."]

        self.response_data["message"] = res_data
        response = json.dumps(self.response_data, indent=2)
        return make_response(response, 200)