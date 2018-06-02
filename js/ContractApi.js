const CONTRACT_ADDRESS = "n1gvL2Km9bxHRcUg4AL5JzbkrgRBmkFhVhD";

class SmartContractApi {
    constructor(contractAdress) {
        let NebPay = require("nebpay");
        this.nebPay = new NebPay();
        this._contractAdress = contractAdress || CONTRACT_ADDRESS;
    }

    getContractAddress() {
        return this.contractAdress;
    }

    _simulateCall({
        value = "0",
        callArgs = "[]",
        callFunction,
        callback
    }) {
        this.nebPay.simulateCall(this._contractAdress, value, callFunction, callArgs, {
            callback: function (resp) {
                if (resp && resp.result && resp.result.startsWith('TypeError')) {
                    console.error(resp);
                }
                if (callback) {
                    callback(resp);
                }
            }
        });
    }

    _call({
        value = "0",
        callArgs = "[]",
        callFunction,
        callback
    }) {
        this.nebPay.call(this._contractAdress, value, callFunction, callArgs, {
            callback: function (resp) {
                if (resp && resp.result && resp.result.startsWith('TypeError')) {
                    console.error(resp);
                }
                if (callback) {
                    callback(resp);
                }
            }
        });
    }
}

class ContractApi extends SmartContractApi {
    getUsername(wallet, cb) {
        let args = wallet ? `["${wallet}"]` : "";

        this._simulateCall({
            callArgs: args,
            callFunction: "getUsername",
            callback: cb
        });
    }

    setUsername(username, cb) {
        this._call({
            callArgs: `["${username}"]`,
            callFunction: "setUsername",
            callback: cb
        });
    }

    getDataItem(wallet, itemKey, cb) {
        wallet = wallet ? `"${wallet}",` : "";
        let args = `[${wallet}${itemKey}"]`;

        this._simulateCall({
            callArgs: args,
            callFunction: "getDataItem",
            callback: cb
        });
    }

    getDataByUsername(username, cb) {
        let args = username ? `["${username}"]` : "";

        this._simulateCall({
            callArgs: args,
            callFunction: "getDataByUsername",
            callback: cb
        });
    }

    getDataByWallet(wallet, cb) {
        let args = wallet ? `["${wallet}"]` : "";

        this._simulateCall({
            callArgs: args,
            callFunction: "getDataByWallet",
            callback: cb
        });
    }

    setData(dataObj, cb) {
        let json = JSON.stringify([JSON.stringify(dataObj)]);

        this._call({
            callArgs: json,
            callFunction: "setData",
            callback: cb
        });
    }
}