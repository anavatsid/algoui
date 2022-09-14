var _command_ = {
    command: "",
    message: {}
};
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};



$(document).ready(function(){

function enable_ui() {
    document.getElementById("tick").disabled = false;
    document.getElementById("reverse").disabled = false;
    document.getElementById("sell").disabled = false;
    document.getElementById("buy").disabled = false;
    document.getElementById("trade_enable").disabled = false;
    document.getElementById("flatten").disabled = false;
};

function disable_ui() {
    document.getElementById("tick").disabled = true;
    document.getElementById("reverse").disabled = true;
    document.getElementById("sell").disabled = true;
    document.getElementById("buy").disabled = true;
    document.getElementById("trade_enable").disabled = true;
    document.getElementById("flatten").disabled = true;
};
    // update options of select box
    function update_ticker_list(words) {
        adultWordSelect = document.getElementById("tick");
        adultWordSelect.innerHTML = "";
//        adultWordSelect.options[adultWordSelect.options.length] = new Option("Choose...", "");
        for (var wd in words) {
            adultWordSelect.options[adultWordSelect.options.length] = new Option(words[wd], words[wd]);
        }
        adultWordSelect.selectedIndex = 0;
//        $("#words_of_input_text").change();
    };

    function update_table(_data_) {
        table_element = document.getElementById("history");
        table_body = document.getElementById("history_data");
        table_body.innerHTML = "";
        for (i in _data_) {
            row = _data_[i];
            row_num = table_body.rows.length;
            tr = table_body.insertRow(row_num);
            for (j in row) {
                td = tr.insertCell();
                td.innerHTML = row[j];
            };
        };
        rows = table_element.rows.length;
    };


    function update_history() {
        var command = {
            command: "",
            message: {}
        };
        command["command"] = "HISTORY";
        command["message"] = {};
        $.ajax({
            url: "/get_request",
            type: "POST",
            contentType:"application/json; charset=utf-8",
            data: JSON.stringify(command),
            dataType: "json",
            success: function (response) {
                if (response["status"] == "success") {
                    if (command["command"] == "HISTORY") {
                        array_hist = response["message"][0];
                        update_table(array_hist);
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

    };

    function initialize_ui() {
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
                        $("#order").val(response["message"][1]);
                        update_ticker_list(response["message"][0]);
                        if (response["message"][2] == true) {
                            document.getElementById("trade_enable").checked = true;
                        } else {
                            document.getElementById("trade_enable").checked = false;
                        };
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
    };

    initialize_ui();

    update_history();

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
                        $("#log").val(response["message"][0]);
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
        global_flag = document.getElementById("trade_enable").checked;
        ticker_name = document.getElementById("tick").value
        _command_["command"] = "TICKER_CHANGED";
        _command_["message"] = {
            global_flag: global_flag,
            ticker_name: document.getElementById("tick").value
        };
        $.ajax({
            url: "/get_request",
            type: "POST",
            contentType:"application/json; charset=utf-8",
            data: JSON.stringify(_command_),
            dataType: "json",
            success: function (response) {
                if (response["status"] == "success") {
                    if (_command_["command"] == "TICKER_CHANGED") {
                        log_msg = "The Current Ticker:" + response["message"][0]
                        $("#log").val(log_msg);
                        $("#order").val(response["message"][1])
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


    // communication between server and front
    function communicate(data) {

        $.ajax({
            url: "/get_request",
            type: "POST",
            contentType:"application/json; charset=utf-8",
            data: JSON.stringify(data),
            dataType: "json",
            success: function (response) {
                if (response["status"] == "success") {
                    if (data["command"] == "REVERSE") {
                        $("#log").val(response["message"][0])
                    } else if (data["command"] == "BUY") {
                        $("#log").val(response["message"][0])
                    } else if (data["command"] == "SELL") {
                        $("#log").val(response["message"][0])
                    } else if (data["command"] == "FLATTEN") {
                        $("#log").val(response["message"][0])
                    }
                    update_history();
                }
                else {
                    alert(response["message"][0]);
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
    $("#reverse").click(function() {
        const data = {
            ticker: document.getElementById("tick").value,
            trade_enabled: $("#trade_enable")[0].checked,
            // qty: document.getElementById("contract_quantity").value,
            // order_direction: $("#order").val(),
        };
        _command_["command"] = "REVERSE";
        _command_["message"] = data;

        disable_ui();
        console.log(_command_);
        communicate(_command_);
    });

    $("#buy").click(function() {
        const data = {
            ticker: document.getElementById("tick").value,
            trade_enabled: $("#trade_enable")[0].checked,
            // qty: document.getElementById("contract_quantity").value,
            // order_direction: $("#order").val(),
        };
        _command_["command"] = "BUY";
        _command_["message"] = data;
        disable_ui();
        communicate(_command_);
    });
    $("#sell").click(function() {
        const data = {
            ticker: document.getElementById("tick").value,
            trade_enabled: $("#trade_enable")[0].checked,
            // qty: document.getElementById("contract_quantity").value,
            // order_direction: $("#order").val(),
        };
        _command_["command"] = "SELL";
        _command_["message"] = data;
        disable_ui();
        communicate(_command_);
    });
    $("#flatten").click(function() {
        const data = {
            ticker: document.getElementById("tick").value,
            trade_enabled: $("#trade_enable")[0].checked,
            // qty: document.getElementById("contract_quantity").value,
            // order_direction: $("#order").val(),
        };
        _command_["command"] = "FLATTEN";
        _command_["message"] = data;
        disable_ui();
        communicate(_command_);
    });

});