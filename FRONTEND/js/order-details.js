$(document).ready(function () {
    loadOrderDetails();
});

function getOrderId() {
    var urlParams = new URLSearchParams(window.location.search);
    var id = urlParams.get("id");
    if (id == null || id === "") {
        return 0;
    }
    var orderId = parseInt(id);
    if (isNaN(orderId)) {
        return 0;
    }
    return orderId;
}

function loadOrderDetails() {
    var orderId = getOrderId();
    if (orderId === 0) {
        showOrderError("Invalid Order", "The order you are looking for could not be found.");
        return;
    }

    $.ajax({
        url: "http://localhost:64867/api/Order/GetOrderDetails?orderId=" + orderId,
        type: "GET",
        xhrFields: {
            withCredentials: true
        },
        success: function (response) {
            console.log("Order details:", response);
            if (response != null && response.Message != null) {
                showOrderError("Unable to View Order", response.Message);
                if (
                    response.Message.toLowerCase().includes("login")) {
                    setTimeout(function () {
                        window.location.href = "login.html";
                    }, 1000);
                }
                return;
            }

            if (response == null || response.OrderId == null) {
                showOrderError("Order Not Found", "The order you are looking for does not exist.");
                return;
            }
            displayOrderDetails(response);
        },
        error: function (xhr) {
            console.log("Order details error:", xhr);
            showOrderError("Unable to Load Order", "Something went wrong while loading the order details.");
        }
    });
}

function displayOrderDetails(order) {
    var items = order.Items || [];
    $("#orderNumberText").text("Order #" + order.OrderId);
    if (items.length === 0) {
        showOrderError("Empty Order", "This order does not contain any paintings.");
        return;
    }

    var totalAmount = order.TotalAmount || 0;
    var container = $("#orderDetailsContainer");
    container.empty();
    var orderCard = $(`
        <div class="order-details-card">
            <div class="order-details-card-header">
                <div class="order-header-left">
                    <div class="order-header-icon">
                        <i class="fa-solid fa-box-open"></i>
                    </div>
                    <div>
                        <span class="order-header-label">Order Number</span>
                        <p class="order-header-number">#${order.OrderId}</p>
                    </div>
                </div>
                <div class="order-header-right">
                    <span class="order-header-total-label">Order Total</span>
                    <span class="order-header-total">₹${totalAmount}</span>
                </div>
            </div>
            <div class="order-items"></div>
            <div class="order-summary-section">
                <div class="summary-row">
                    <span>Total Items</span>
                    <strong>${getTotalQuantity(items)}</strong>
                </div>
                <div class="summary-divider"></div>
                <div class="summary-total">
                    <span>Total Amount</span>
                    <strong>₹${totalAmount}</strong>
                </div>
            </div>
        </div>
        <div class="order-actions">
            <a href="orders.html" class="order-action-button secondary-action">
                <i class="fa-solid fa-list"></i>
                My Orders
            </a>
            <a href="products.html" class="order-action-button primary-action">
                <i class="fa-solid fa-palette"></i>
                Continue Shopping
            </a>
        </div>`);

    var itemsContainer = orderCard.find(".order-items");

    $.each(items, function (index, item) {
        var itemTotal = item.ProductPrice * item.Quantity;
        itemsContainer.append(`
            <div class="order-item">
                <img src="${item.ProductImage}" alt="${item.ProductName}" class="order-item-image">
                <div class="order-item-info">
                    <h3 class="order-item-name">${item.ProductName}</h3>
                    <p class="order-item-description">${item.ProductDescription}</p>
                    <div class="order-item-meta">
                        <span>Quantity:<strong>${item.Quantity}</strong></span>
                        <span>Price:<strong>₹${item.ProductPrice}</strong></span>
                    </div>
                </div>
                <div class="order-item-price">
                    <span class="order-item-unit-price">Item Total</span>
                    <span class="order-item-total">₹${itemTotal}</span>
                </div>
            </div>`);
    });
    container.append(orderCard);
}

function getTotalQuantity(items) {
    var totalQuantity = 0;
    $.each(items, function (index, item) {
        totalQuantity += parseInt(item.Quantity) || 0;
    });
    return totalQuantity;
}

function showOrderError(title, message) {
    $("#orderDetailsContainer").html(`
        <div class="order-error">
            <div class="order-error-icon">
                <i class="fa-solid fa-box-open"></i>
            </div>
            <h2>${title}</h2>
            <p>${message}</p>
            <a href="orders.html" class="order-action-button primary-action">
                <i class="fa-solid fa-arrow-left"></i>
                Back to My Orders
            </a>
        </div>`);
}

function showOrderMessage(message, type) {
    $("#orderDetailsMessage").removeClass("error success").addClass(type).text(message).show();
}