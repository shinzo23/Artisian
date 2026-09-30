var paymentCartItems = [];
var shippingCharge = 199;
var paymentTotal = 0;

$(document).ready(function () {
    loadPaymentPage();
    $("#paymentForm").on("submit", function (event) {
        event.preventDefault();
        processPayment();
    });

    $("#cardNumber").on("input", function () {
        formatCardNumber();
    });

    $("#expiryDate").on("input", function () {
        formatExpiryDate();
    });

    $("#cvv").on("input", function () {
        this.value = this.value.replace(/\D/g, "");
    });
});

function loadPaymentPage() {

    $.ajax({
        url: "http://localhost:64867/api/User/GetCurrentUser",
        type: "GET",
        xhrFields: {
            withCredentials: true
        },
        success: function (user) {
            if (user == null) {
                showPaymentMessage("Please login before proceeding to payment.", "error");
                setTimeout(function () {
                    window.location.href = "login.html";
                }, 1000);
                return;
            }
            loadPaymentCart(user.UserId);
        },
        error: function (xhr) {
            console.log("Current user error:", xhr);
            showPaymentMessage(
                "Please login before proceeding to payment.",
                "error"
            );
        }
    });
}

function loadPaymentCart(userId) {
    $.ajax({
        url: "http://localhost:64867/api/Cart/GetCartItems?userId=" + userId,
        type: "GET",
        xhrFields: {
            withCredentials: true
        },
        success: function (items) {
            if (items == null || items.length === 0) {
                showPaymentMessage("Your cart is empty.", "error");
                $("#paymentItems").html(`
                    <div class="summary-loading">
                        <i class="fa-solid fa-cart-shopping"></i>
                        Your cart is empty.
                    </div>`);
                $("#payButton").prop("disabled", true);
                return;
            }
            paymentCartItems = items;
            displayPaymentItems(items);
            calculatePaymentTotal(items);
        },
        error: function (xhr) {
            console.log("Payment cart error:", xhr);
            showPaymentMessage("Unable to load your cart.", "error");
        }
    });
}

function displayPaymentItems(items) {
    var container = $("#paymentItems");
    container.empty();
    $.each(items, function (index, item) {
        var itemTotal = item.Price * item.Quantity;
        container.append(`
            <div class="payment-item">
                <img src="${item.Image}" alt="${item.ProductName}" class="payment-item-image">
                <div>
                    <p class="payment-item-name">${item.ProductName}</p>
                    <p class="payment-item-quantity">Quantity: ${item.Quantity}</p>
                </div>
                <span class="payment-item-price">₹${itemTotal}</span>
            </div>`);
    });
}

function calculatePaymentTotal(items) {
    var subtotal = 0;
    $.each(items, function (index, item) {
        subtotal += item.Price * item.Quantity;
    });
    paymentTotal = subtotal + shippingCharge;
    $("#subtotalAmount").text(subtotal);
    $("#shippingAmount").text(shippingCharge);
    $("#totalAmount").text(paymentTotal);
    $("#payButtonAmount").text(paymentTotal);
}

function formatCardNumber() {
    var value = $("#cardNumber").val();
    value = value.replace(/\D/g, "");
    if (value.length > 16) {
        value = value.substring(0, 16);
    }
    var formatted = value.match(/.{1,4}/g);
    if (formatted != null) {
        $("#cardNumber").val(formatted.join(" "));
    }
    else {
        $("#cardNumber").val("");
    }
}

function formatExpiryDate() {
    var value = $("#expiryDate").val();
    value = value.replace(/\D/g, "");
    if (value.length > 4) {
        value = value.substring(0, 4);
    }
    if (value.length > 2) {
        value = value.substring(0, 2) + "/" + value.substring(2);
    }
    $("#expiryDate").val(value);
}

function validatePaymentForm() {
    var isValid = true;
    clearPaymentErrors();
    var cardName = $.trim($("#cardName").val());
    var cardNumber = $("#cardNumber").val().replace(/\s/g, "");
    var expiryDate = $("#expiryDate").val();
    var cvv = $("#cvv").val();

    if (cardName === "") {
        $("#cardNameError").text("Please enter the card holder name.");
        isValid = false;
    }

    if (cardNumber === "") {
        $("#cardNumberError").text("Please enter the card number.");
        isValid = false;
    }
    else if (!/^\d{16}$/.test(cardNumber)) {
        $("#cardNumberError").text("Card number must contain 16 digits.");
        isValid = false;
    }

    if (expiryDate === "") {
        $("#expiryDateError").text("Please enter the expiry date.");
        isValid = false;
    }
    else if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
        $("#expiryDateError").text("Enter expiry date in MM/YY format.");
        isValid = false;
    }
    else {
        var parts = expiryDate.split("/");
        var month = parseInt(parts[0]);
        var year = parseInt(parts[1]);
        if (month < 1 || month > 12) {
            $("#expiryDateError").text("Enter a valid expiry month.");
            isValid = false;
        }
        else {
            var currentDate = new Date();
            var currentYear = currentDate.getFullYear() % 100;
            var currentMonth = currentDate.getMonth() + 1;
            if (year < currentYear || (year === currentYear && month < currentMonth)) {
                $("#expiryDateError").text("This card has expired.");
                isValid = false;
            }
        }
    }

    if (cvv === "") {
        $("#cvvError").text("Please enter the CVV.");
        isValid = false;
    }
    else if (!/^\d{3,4}$/.test(cvv)) {
        $("#cvvError").text("CVV must contain 3 digits.");
        isValid = false;
    }
    return isValid;
}

function clearPaymentErrors() {
    $(".field-error").text("");
}

function processPayment() {
    if (paymentTotal <= 0) {
        showPaymentMessage("Unable to process payment because your cart is empty.", "error");
        return;
    }

    if (!validatePaymentForm()) {
        return;
    }

    var button = $("#payButton");
    button.prop("disabled", true);
    button.html(`<i class="fa-solid fa-spinner fa-spin"></i>Processing Payment...`);

    setTimeout(function () {
        placeOrder();
    }, 700);
}

function placeOrder() {
    $.ajax({
        url: "http://localhost:64867/api/Order/PlaceOrder",
        type: "POST",
        xhrFields: {
            withCredentials: true
        },
        success: function (response) {
            if (response == null || response.OrderId == null) {
                showPaymentMessage(response != null && response.Message != null ? response.Message : "Unable to place the order.", "error");
                restorePayButton();
                return;
            }

            showPaymentMessage("Payment successful. Your order has been placed.", "success");
            $("#payButton").html(`<i class="fa-solid fa-check"></i>Order Placed`);

            setTimeout(function () {
                window.location.href = "order-details.html?id=" + response.OrderId;
            }, 1000);
        },
        error: function (xhr) {
            console.log("Place order error:", xhr);
            var message = "Unable to place your order.";
            if (xhr.responseJSON != null && xhr.responseJSON.Message != null) {
                message = xhr.responseJSON.Message;
            }
            showPaymentMessage(message, "error");
            restorePayButton();
        }
    });
}

function restorePayButton() {
    $("#payButton").prop("disabled", false).html(`<i class="fa-solid fa-lock"></i><span>Pay ₹${paymentTotal}</span>`);
}

function showPaymentMessage(message, type) {
    $("#paymentMessage").removeClass("error success").addClass(type).text(message).show();
}