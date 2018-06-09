const CONTRACT_ADDRESS = "n1fasGLi616KgrxNGfoGVPYxuGRdJKFCjut";

class SmartContractApi {
    constructor(contractAdress) {
        let Nebulas = require("nebulas");
        this.neb = new Nebulas.Neb();
        this.neb.setRequest(new Nebulas.HttpRequest("https://mainnet.nebulas.io"));

        let NebPay = require("nebpay");
        this.nebPay = new NebPay();
        this._contractAdress = contractAdress || CONTRACT_ADDRESS;
    }

    getContractAddress() {
        return this._contractAdress;
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
        callback,
        callbackError
    }) {
        let self = this;
        this.nebPay.call(this._contractAdress, value, callFunction, callArgs, {
            callback: resp => {
                if (resp) {
                    if (resp.result && resp.result.startsWith('TypeError')) {
                        console.error(resp);
                    }
                    if (resp == "Error: Transaction rejected by user") {
                        console.warn(resp);
                        if (callbackError) {
                            callbackError({
                                rejected: true
                            });
                        }
                        return;
                    }
                    self._waitTransaction(resp.txhash, callback, callbackError);
                }
            }
        });
    }

    _waitTransaction(txhash, callback, callbackError) {
        let self = this;
        this.neb.api.getTransactionReceipt({
            hash: txhash
        }).then(function it(receipt) {
            let status = receipt.status;
            if (status == 0) { // failed
                console.error(receipt);
                if (callbackError) {
                    callbackError(receipt);
                }
            }
            if (status == 1 && callback) { // successful
                callback(receipt);
            }
            if (status == 2) { // pending
                setTimeout(() => self.neb.api.getTransactionReceipt({
                    hash: txhash
                }).then(it), 1000);
                return;
            }
            return status;
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

    setUsername(username, cb, cbErr) {
        this._call({
            callArgs: `["${username}"]`,
            callFunction: "setUsername",
            callback: cb,
            callbackError: cbErr
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

    setData(dataObj, cb, cbErr) {
        let json = JSON.stringify([JSON.stringify(dataObj)]);

        this._call({
            callArgs: json,
            callFunction: "setData",
            callback: cb,
            callbackError: cbErr
        });
    }

    sendPayment(wallet, cb, cbErr) {
        this._call({
            value: 1,
            callArgs: `["${wallet}"]`,
            callFunction: "sendPayment",
            callback: cb,
            callbackError: cbErr
        });
    }
}