var orders = [];

$(document).ready(function () {
    loadMyOrders();
});

function loadMyOrders() {
    $("#ordersLoading").show();
    $("#ordersList").hide();
    $("#emptyOrders").hide();
    hideOrdersMessage();

    $.ajax({
        url:
            "http://localhost:64867/api/Order/GetMyOrders",
        type: "GET",
        xhrFields: {
            withCredentials: true
        },
        success: function (response) {

            $("#ordersLoading").hide();


            if (response == null) {

                showOrdersMessage(
                    "Unable to load your orders.",
                    "error"
                );

                return;

            }
            if (response.Orders != null) {

                orders = response.Orders;

            }
            else if (Array.isArray(response)) {

                orders = response;

            }
            else {

                orders = [];

            }


            if (orders.length === 0) {

                $("#emptyOrders").show();

                return;

            }


            displayOrders(orders);

        },

        error: function (xhr) {

            $("#ordersLoading").hide();

            console.log(
                "Orders loading error:",
                xhr
            );

            var message =
                "Unable to load your orders.";


            if (
                xhr.responseJSON != null &&
                xhr.responseJSON.Message != null
            ) {

                message =
                    xhr.responseJSON.Message;

            }


            showOrdersMessage(
                message,
                "error"
            );

        }

    });

}


function displayOrders(orderData) {

    var container =
        $("#ordersList");


    container.empty();


    $.each(orderData, function (index, order) {

        var orderId =
            order.OrderId;


        var items =
            order.Items ||
            order.OrderItems ||
            [];


        var total =
            calculateOrderTotal(
                items,
                order
            );


        var itemsHtml =
            "";


        if (items.length === 0) {

            itemsHtml = `
                <div class="order-item">

                    <div class="order-item-info">

                        <p class="order-item-name myOrders">
                            Order #${orderId}
                        </p>

                    </div>

                </div>
            `;

        }
        else {

            $.each(items, function (itemIndex, item) {

                var productName =
                    item.ProductName ||
                    "Painting";


                var quantity =
                    item.Quantity || 0;


                var price =
                    getItemPrice(item);


                var itemTotal =
                    price * quantity;


                itemsHtml += `

                    <div class="order-item">

                        <div class="order-item-info">

                            <p class="order-item-name">
                                ${escapeHtml(productName)}
                            </p>

                            <div class="order-item-meta">

                                <span>
                                    <i class="fa-solid fa-cubes"></i>
                                    Quantity: ${quantity}
                                </span>

                                <span>
                                    <i class="fa-solid fa-indian-rupee-sign"></i>
                                    Price: ₹${price}
                                </span>

                            </div>

                        </div>


                        <div class="order-item-price">

                            <span class="item-unit-price">
                                ${quantity} × ₹${price}
                            </span>

                            ₹${itemTotal}

                        </div>

                    </div>

                `;

            });

        }


        var itemCount =
            getOrderItemCount(items);


        var orderHtml = `

            <div class="order-card">

                <div class="order-card-header">

                    <div class="order-number">

                        <i class="fa-solid fa-receipt"></i>

                        <span>
                            ORDER #${orderId}
                        </span>

                    </div>


                    <div class="order-total-header">

                        <span class="order-total-label">
                            Total
                        </span>

                        <span class="order-total-value">
                            ₹${total}
                        </span>

                    </div>

                </div>


                <div class="order-items">

                    ${itemsHtml}

                </div>


                <div class="order-card-footer">

                    <a
                        href="order-details.html?id=${orderId}"
                        class="details-button"
                    >

                        View Details

                        <i class="fa-solid fa-arrow-right"></i>

                    </a>

                </div>

            </div>

        `;


        container.append(orderHtml);

    });


    container.show();

}


function getItemPrice(item) {

    if (item.Price != null) {

        return Number(item.Price);

    }


    if (item.ProductPrice != null) {

        return Number(item.ProductPrice);

    }


    if (
        item.Product != null &&
        item.Product.Price != null
    ) {

        return Number(
            item.Product.Price
        );

    }


    return 0;

}

function calculateOrderTotal(items, order) {

    if (order.TotalAmount != null) {

        return Number(
            order.TotalAmount
        );

    }


    var total = 0;


    $.each(items, function (index, item) {

        var price =
            getItemPrice(item);


        var quantity =
            Number(item.Quantity) || 0;


        total +=
            price * quantity;

    });


    return total;

}


function getOrderItemCount(items) {

    var count = 0;


    $.each(items, function (index, item) {

        count +=
            Number(item.Quantity) || 0;

    });


    return count;

}


function escapeHtml(value) {

    return $("<div>")
        .text(value)
        .html();

}


function showOrdersMessage(
    message,
    type
) {

    $("#ordersMessage")
        .removeClass("error success")
        .addClass(type)
        .text(message)
        .show();

}


function hideOrdersMessage() {

    $("#ordersMessage")
        .removeClass("error success")
        .text("")
        .hide();

}