let wallet = "";

$(document).ready(() => {
    isExtensionExist = typeof (webExtensionWallet) !== "undefined";

    if (!isExtensionExist) {
        document.querySelector(".noExtension").attributes.removeNamedItem("hidden");
    }

    _loadData();
    editProfileHandler();
    addFieldHandler();

    $("#username").on('input', () => {
        $(`*[data-id=profileLinkUser]`).attr("href", "wallet.html?u=" + $(`#username`)[0].value);
    });
});

function _loadData() {
    window.postMessage({
        "target": "contentscript",
        "data": {},
        "method": "getAccount",
    }, "*");
}

window.addEventListener('message', function (e) {
    if (e.data.data && !!e.data.data.account) {
        wallet = e.data.data.account;
        $(`*[data-id=account-wallet]`).html(wallet);
        $(`*[data-id=account-link]`).attr("href", "wallet.html?w=" + wallet);

        loadAccount();

        if (window.location.href.includes("wallet.html")) {
            loadProfile();
        }
    }
});

function editProfileHandler() {
    let form = document.querySelector("#editProfile");
    form.onsubmit = function (event) {
        event.preventDefault();

        let data = {};
        data.username = $("#username").val();
        data.name = $("#name").val();
        data.email = $("#email").val();

        let items = $(".fields .data-item");

        for (let item of items) {
            let inputs = item.children;

            let key = inputs[0].value.trim();
            let val = inputs[1].value.trim();

            if (key != "") {
                data[key] = val;
            }
        }

        contract.setData(data, (resp) => {});
    }
}

function addFieldHandler() {

    $("#addData").click(() => {
        let itemsCount = $(".data-item").length;
        let innerHtml =
            `<div class="input-group form-control-sm d-flex align-items-center data-item" data-id="item-${itemsCount}">
                <input type="text" class="form-control form-control-sm key" placeholder="key" maxlength="100">
                <input type="text" class="form-control form-control-sm value" placeholder="value" maxlength="100">
                <a href="#" class="removeItem"><i class="far fa-times"></i></a>
            </div>`;

        let container = document.querySelector(".fields");
        let div = document.createElement('div');
        div.innerHTML = innerHtml;
        container.append(div.firstChild);

        $(`[data-id=item-${itemsCount}] .removeItem`).click(() => {
            $(`[data-id=item-${itemsCount}]`).remove();
        });
    });
}