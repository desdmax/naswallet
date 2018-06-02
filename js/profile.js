$(document).ready(() => {
    var accountData = JSON.parse(localStorage.getItem('account'));
    showAccount(accountData);
    loadAccount();

    if (window.location.href.includes("wallet.html")) {
        loadProfile();
    }
});

function loadAccount() {
    contract.getDataByWallet(wallet, (resp) => {
        if (resp && resp.result && !resp.result.startsWith("TypeError:")) {
            let data = JSON.parse(resp.result);
            showAccount(data);
        } else {
            loadAccount();
        }
    });
}

function loadProfile() {
    let username = $.urlParam('u');
    let userWallet = $.urlParam('w');

    if (username != null) {
        $("[data-id=profile-username]").html("@" + username);

        contract.getDataByUsername(username, (resp) => {
            if (resp && resp.result && !resp.result.startsWith("TypeError:")) {
                let data = JSON.parse(resp.result);
                showProfile(data, "not found :(", username);
            } else {
                loadProfile();
            }
        });
    } else if (userWallet != null) {
        $("[data-id=profile-wallet]").html(userWallet);
        setDonateHandler(userWallet);

        if (userWallet == wallet) {
            $(".wallet-profile .editProfile").removeClass("hidden");
        }

        contract.getDataByWallet(userWallet, (resp) => {
            if (resp && resp.result && !resp.result.startsWith("TypeError:")) {
                let data = JSON.parse(resp.result);
                showProfile(data, userWallet, "noname");
            } else {
                loadProfile();
            }
        });
    }
}

function showAccount(data) {
    let username = "";
    let name = "";
    let email = "";

    localStorage.setItem('account', JSON.stringify(data));
    document.querySelector(".fields").innerHTML = "";

    if (data != null) {
        for (let item of data) {
            if (item.key == "username") {
                username = item.value;
                $(`[data-id=account-link]`).attr("href", "wallet.html?u=" + username);
            } else if (item.key == "name") {
                name = item.value;
            } else if (item.key == "email") {
                email = item.value;
            } else if (item.key != "wallet") {
                let itemsCount = $(".data-item").length;
                let innerHtml =
                    `<div class="input-group form-control-sm d-flex align-items-center data-item" data-id="item-${itemsCount}">
                        <input type="text" class="form-control form-control-sm key" placeholder="key" maxlength="100" value="${item.key}">
                        <input type="text" class="form-control form-control-sm value" placeholder="value" maxlength="100" value="${item.value}">
                        <a href="#" class="removeItem"><i class="far fa-times"></i></a>
                    </div>`;

                let container = document.querySelector(".fields");
                let div = document.createElement('div');
                div.innerHTML = innerHtml;
                container.append(div.firstChild);

                $(`[data-id=item-${itemsCount}] .removeItem`).click(() => {
                    $(`[data-id=item-${itemsCount}]`).remove();
                });
            }
        }
    }

    $(`[data-id=form-username]`).val(username);
    $(`[data-id=form-name]`).val(name);
    $(`[data-id=form-email]`).val(email);

    username = username ? username : "noname";
    name = name ? name : "No Name";
    $(`[data-id=account-username]`).html("@" + username);
    $(`[data-id=account-name]`).html(name);
}

function showProfile(data, profileWallet, username) {
    let itemsHtml = "";
    let name = "";
    let email = "";

    if (data != null) {
        for (let item of data) {
            if (item.key == "wallet") {
                profileWallet = item.value;
                setDonateHandler(profileWallet);

                if (profileWallet == wallet) {
                    $(".wallet-profile .editProfile").removeClass("hidden");
                }
            } else if (item.key == "username") {
                username = item.value;
            } else if (item.key == "name") {
                name = item.value;
            } else if (item.key == "email") {
                email = item.value;
            } else {
                itemsHtml +=
                    `<div class="data-item d-flex align-items-center">
                    <div class="key">${item.key}:</div>
                    <div>
                        ${item.value}
                    </div>
                </div>`;
            }
        }
    }

    let innerHtml =
        `<div class="data-item wallet d-flex align-items-center">
            <div class="img"></div>
            <div data-id="profile-wallet">${profileWallet}</div>
        </div>`;

    if (name != "") {
        innerHtml +=
            `<div class="data-item name d-flex align-items-center">
                <div class="fal fa-user"></div>
                <div>
                    ${name}
                </div>
            </div>`;
    }
    if (email != "") {
        innerHtml +=
            `<div class="data-item name d-flex align-items-center">
                <div class="fal fa-at"></div>
                <div>
                    ${email}
                </div>
            </div>`;
    }

    username = username != "" ? username : "noname"
    $(`[data-id=profile-username]`).html("@" + username);

    let container = document.querySelector(".body");
    container.innerHTML = innerHtml + itemsHtml;
}

function setDonateHandler(wallet) {
    var NebPay = require("nebpay");
    var nebPay = new NebPay();

    $("#donate").off("click");
    $("#donate").click(() => {
        if (isExtensionExist) {
            nebPay.pay(wallet, 0, {
                qrcode: {
                    showQRCode: false
                },
            });
        }
    });
}

$.urlParam = function (name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    return results == null ? null : results[1];
}