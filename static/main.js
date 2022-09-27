var _command_ = {
    command: "",
    message: {}
};
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

var tick_info = {};
var selected_index = null;


$(document).ready(function(){

function enable_ui() {
    document.getElementById("tick").disabled = false;
    document.getElementById("reverse").disabled = false;
    document.getElementById("sell").disabled = false;
    document.getElementById("buy").disabled = false;
    document.getElementById("trade_enable").disabled = false;
    document.getElementById("flatten").disabled = false;
    document.getElementById("history").style.pointerEvents = 'auto';
    document.getElementById("history").style.cursor = 'pointer';

};

function disable_ui() {
    document.getElementById("tick").disabled = true;
    document.getElementById("reverse").disabled = true;
    document.getElementById("sell").disabled = true;
    document.getElementById("buy").disabled = true;
    document.getElementById("trade_enable").disabled = true;
    document.getElementById("flatten").disabled = true;
    document.getElementById("history").style.pointerEvents = 'none';
    document.getElementById("history").style.cursor = 'default';
};
    // update options of select box
    function update_ticker_list(words) {
        adultWordSelect = document.getElementById("tick");
        adultWordSelect.innerHTML = "";
//        adultWordSelect.options[adultWordSelect.options.length] = new Option("Choose...", "");
        for (var wd in words) {
            adultWordSelect.options[adultWordSelect.options.length] = new Option(words[wd], words[wd]);
        }
        if (selected_index == null) {
            selected_index = 0;
        }
        adultWordSelect.selectedIndex = selected_index;
//        $("#words_of_input_text").change();
    };


    // function update_history() {
    //     var command = {
    //         command: "",
    //         message: {}
    //     };
    //     command["command"] = "HISTORY";
    //     command["message"] = {};
    //     $.ajax({
    //         url: "/get_request",
    //         type: "POST",
    //         contentType:"application/json; charset=utf-8",
    //         data: JSON.stringify(command),
    //         dataType: "json",
    //         success: function (response) {
    //             if (response["status"] == "success") {
    //                 if (command["command"] == "HISTORY") {
    //                     array_hist = response["message"][0];
    //                     update_table(array_hist);
    //                 };
    //             }
    //             else {
    //                 alert(response["message"][0]);
    //             }
    //         },
    //         error: function (request, response) {
    //             alert("Server Error. Try again later.");
    //             return ;
    //         },
    //         complete: function(response) {
    //         }
    //     });

    // };

    function initialize_ui() {
        disable_ui();
        _command_["command"] = "INITIALIZE";
        _command_["message"] = {};
        $.ajax({
            url: "/get_request",
            type: "POST",
            contentType:"application/json; charset=utf-8",
            data: JSON.stringify(_command_),
            dataType: "json",
            success: function (response) {
                if (response["status"] == "success") {
//                                console.log(response);

                    if (_command_["command"] == "INITIALIZE") {
                        // $("#order").val(response["message"][1]);
                        update_ticker_list(response["message"][0]);
                        if (response["message"][2] == true) {
                            document.getElementById("trade_enable").checked = true;
                        } else {
                            document.getElementById("trade_enable").checked = false;
                        };
                        tick_info = response["message"][1];
                    };
                    $("#order_qty").val("0");
                    $("#tick").change();
                    enable_ui();
                }
                else {
                    alert(response["message"][0]);
                }
            },
            error: function (request, response) {
                alert("Server Error. Try again later.");
                return ;
            },
            complete: function(response) {
            }
        });
    };

    initialize_ui();

    // update_history();


    $("#trade_enable").change(function(){
        global_flag = document.getElementById("trade_enable").checked;
        _command_["command"] = "GLOBAL_CHANGED";
        _command_["message"] = {
            global_flag: global_flag
        };
        $.ajax({
            url: "/get_request",
            type: "POST",
            contentType:"application/json; charset=utf-8",
            data: JSON.stringify(_command_),
            dataType: "json",
            success: function (response) {
                if (response["status"] == "success") {
                    if (_command_["command"] == "GLOBAL_CHANGED") {
                        console.log(response["message"][0]);
                    };
                }
                else {
                    alert(response["message"][0]);
                }
            },
            error: function (request, response) {
                alert("Server Error. Try again later.");
                return ;
            },
            complete: function(response) {
            }
        });

    });


    // ticker chagned
    $("#tick").change(function(){
        // disable_ui();
        global_flag = document.getElementById("trade_enable").checked;
        ticker_name = document.getElementById("tick").value;
        selected_ticker_position = tick_info[ticker_name]["position"];
        $("#contract_position").val(selected_ticker_position);
        selected_index = document.getElementById("tick").selectedIndex;
        console.log("selected index : ", selected_index);
        log_msg = "The Current Ticker:" + ticker_name;
        document.title = ticker_name;
        $("#log").val(log_msg);
        // _command_["command"] = "TICKER_CHANGED";
        // _command_["message"] = {
        //     global_flag: global_flag,
        //     ticker_name: document.getElementById("tick").value
        // };
        // $.ajax({
        //     url: "/get_request",
        //     type: "POST",
        //     contentType:"application/json; charset=utf-8",
        //     data: JSON.stringify(_command_),
        //     dataType: "json",
        //     success: function (response) {
        //         if (response["status"] == "success") {
        //             if (_command_["command"] == "TICKER_CHANGED") {
        //                 log_msg = "The Current Ticker:" + response["message"][0]
        //                 $("#log").val(log_msg);
        //                 $("#contract_position").val(response["message"][1]);
        //                 console.log(response["message"][1]);
        //             };
        //         }
        //         else {
        //             alert(response["message"][0]);
        //         }
        //         enable_ui();
        //     },
        //     error: function (request, response) {
        //         alert("Server Error. Try again later.");
        //         return ;
        //     },
        //     complete: function(response) {
        //     }
        // });

    });

    $("#refresh").mouseup(function() {
        initialize_ui();
    });


    // communication between server and front
    function communicate(data) {
        $("#log").val("Order Processing...");
        $.ajax({
            url: "/get_request",
            type: "POST",
            contentType:"application/json; charset=utf-8",
            data: JSON.stringify(data),
            dataType: "json",
            success: function (response) {
                // console.log(response)
                if (response["status"] == "success") {
                    if (data["command"] == "REVERSE") {
                        $("#log").val(response["message"][0]);
                        $("#contract_position").val(response["message"][1])
                    } else if (data["command"] == "BUY") {
                        $("#log").val(response["message"][0]);
                        $("#contract_position").val(response["message"][1])
                    } else if (data["command"] == "SELL") {
                        $("#log").val(response["message"][0]);
                        $("#contract_position").val(response["message"][1])
                    } else if (data["command"] == "FLATTEN") {
                        $("#log").val(response["message"][0]);
                        $("#contract_position").val(response["message"][1])
                    }
                    // update_history();
                }
                else {
                    $("#log").val(response["message"][0]);
                };
                enable_ui();
            },
            error: function (request, response) {
                alert("Server Error. Try again later.");
                return ;
            },
            complete: function(response) {
            }
        });


    };

    // Click of button of "reverse"
    $("#reverse").mouseup(function() {
        cur_postion = document.getElementById("contract_position").value
        if (cur_postion == "") {
            cur_postion = "0"

        };
        if (cur_postion == "0") {
            alert("Current Position is zero!");
            return;
        };

        input_qty = document.getElementById("order_qty").value
        if (input_qty == "") {
            input_qty = "0"

        };

        const data = {
            ticker: document.getElementById("tick").value,
            trade_enabled: $("#trade_enable")[0].checked,
            position: cur_postion,
            order_qty: input_qty,
        };
        _command_["command"] = "REVERSE";
        _command_["message"] = data;

        disable_ui();
        console.log(_command_);
        communicate(_command_);
    });


    $("#buy").mouseup(function() {
        input_qty = document.getElementById("order_qty").value
        if (input_qty == "") {
            alert("Please input quantity.");
            return;
        };
        if (input_qty == "0") {
            alert("Please input quantity.");
            return;
        };
        cur_postion = document.getElementById("contract_position").value
        if (cur_postion == "") {
            cur_postion = "0"
        };
        
        const data = {
            ticker: document.getElementById("tick").value,
            trade_enabled: $("#trade_enable")[0].checked,
            position: cur_postion,
            order_qty: input_qty,
        };
        _command_["command"] = "BUY";
        _command_["message"] = data;
        disable_ui();
        communicate(_command_);
    });

    $("#sell").mouseup(function() {
        input_qty = document.getElementById("order_qty").value
        if (input_qty == "") {
            alert("Please input quantity.");
            return;
        };
        if (input_qty == "0") {
            alert("Please input quantity.");
            return;
        };
        cur_postion = document.getElementById("contract_position").value
        if (cur_postion == "") {
            cur_postion = "0"
        };
        
        const data = {
            ticker: document.getElementById("tick").value,
            trade_enabled: $("#trade_enable")[0].checked,
            position: cur_postion,
            order_qty: input_qty,
        };

        _command_["command"] = "SELL";
        _command_["message"] = data;
        disable_ui();
        communicate(_command_);
    });

    $("#flatten").mouseup(function() {
        cur_postion = document.getElementById("contract_position").value
        if (cur_postion == "") {
            cur_postion = "0"
        };
        if (cur_postion == "0") {
            alert("Current Position is zero!");
            return;
        };
        input_qty = document.getElementById("order_qty").value
        if (input_qty == "") {
            input_qty = "0"

        };
        const data = {
            ticker: document.getElementById("tick").value,
            trade_enabled: $("#trade_enable")[0].checked,
            position: cur_postion,
            order_qty: input_qty,
        };
        _command_["command"] = "FLATTEN";
        _command_["message"] = data;
        disable_ui();
        console.log(_command_);
        communicate(_command_);
    });

    // $("#history").mouseup(function() {
    //     // const data = {
    //     //     ticker: document.getElementById("tick").value,
    //     //     trade_enabled: $("#trade_enable")[0].checked,
    //     //     position: document.getElementById("contract_position").value,
    //     //     order_qty: $("#order_qty").val(),
    //     // };
    //     // _command_["command"] = "FLATTEN";
    //     // _command_["message"] = data;
    //     // disable_ui();
    //     // communicate(_command_);

    // });
});