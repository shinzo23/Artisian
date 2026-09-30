var API_BASE_URL = "http://localhost:64867/api";

var currentUser = null;
var cartItems = [];
var SHIPPING_CHARGE = 199;

$(document).ready(function () {
    loadCurrentUser();
    setupButtons();
});

function loadCurrentUser() {
    $.ajax({
        url: API_BASE_URL + "/User/GetCurrentUser",
        type: "GET",
        xhrFields: {
            withCredentials: true
        },
        success: function (user) {
            if (user == null) {
                window.location.href = "login.html";
                return;
            }
            currentUser = user;
            loadCart();
        },

        error: function () {
            window.location.href = "login.html";
        }
    });
}

function loadCart() {
    $("#cartLoading").removeClass("hidden");
    $("#emptyCart").addClass("hidden");
    $("#cartItemsContainer").empty();

    $.ajax({
        url: API_BASE_URL + "/Cart/GetCartItems",
        type: "GET",
        data: {
            userId: currentUser.UserId
        },
        xhrFields: {
            withCredentials: true
        },
        success: function (data) {
            $("#cartLoading").addClass("hidden");
            cartItems = data || [];
            if (cartItems.length == 0) {
                showEmptyCart();
                updateSummary();
                return;
            }
            renderCartItems();
            updateSummary();
        },

        error: function (xhr) {
            $("#cartLoading").addClass("hidden");
            console.log(
                "Get cart error:",
                xhr
            );
            $("#cartItemsContainer").html(
                '<div class="cart-message">' +
                '<i class="fa-solid fa-circle-exclamation"></i> ' +
                'Unable to load your cart.' +
                '</div>'
            );
        }
    });
}

function renderCartItems() {
    var container = $("#cartItemsContainer");
    container.empty();
    $.each(cartItems, function (index, item) {
        var imagePath = item.Image;
        if (imagePath == null || imagePath == "") {
            imagePath = "images/no-image.png";
        }

        var html =
            '<div class="cart-item">' +

            '<div class="cart-item-image">' +

            '<img src="' +
            imagePath +
            '" alt="' +
            escapeHtml(item.ProductName) +
            '">' +

            '</div>' +
            '<div class="cart-item-info">' +

            '<div class="cart-item-category">' +
            'Painting' +
            '</div>' +
            '<h3 class="cart-item-name">' +
            escapeHtml(item.ProductName) +
            '</h3>' +

            '<p class="cart-item-description">' +
            escapeHtml(item.Description || "") +
            '</p>' +

            '<div class="cart-item-price">' +
            '₹' +
            item.Price +
            '</div>' +

            '<div class="cart-item-stock">' +
            'Available stock: ' +
            item.Stock +
            '</div>' +

            '</div>' +
            '<div class="cart-item-actions">' +

            '<div class="item-subtotal">' +
            '₹' +
            (item.Price * item.Quantity) +
            '</div>' +


            '<div class="quantity-control">' +

            '<button ' +
            'class="quantity-button decrease-quantity" ' +
            'data-id="' +
            item.CartItemId +
            '" ' +
            'data-product="' +
            item.ProductId +
            '" ' +
            'data-quantity="' +
            item.Quantity +
            '" ' +
            'type="button">' +

            '<i class="fa-solid fa-minus"></i>' +

            '</button>' +


            '<span class="quantity-value">' +
            item.Quantity +
            '</span>' +


            '<button ' +
            'class="quantity-button increase-quantity" ' +
            'data-id="' +
            item.CartItemId +
            '" ' +
            'data-product="' +
            item.ProductId +
            '" ' +
            'data-quantity="' +
            item.Quantity +
            '" ' +
            'data-stock="' +
            item.Stock +
            '" ' +
            'type="button">' +

            '<i class="fa-solid fa-plus"></i>' +

            '</button>' +

            '</div>' +


            '<button ' +
            'class="remove-item-button" ' +
            'data-id="' +
            item.CartItemId +
            '" ' +
            'type="button">' +

            '<i class="fa-solid fa-trash"></i> Remove' +

            '</button>' +

            '</div>' +

            '</div>';
        container.append(html);

    });
    setupItemButtons();

}

function setupItemButtons() {
    $(".increase-quantity").click(function () {

        var productId =
            $(this).data("product");

        var quantity =
            parseInt($(this).data("quantity"));

        var stock =
            parseInt($(this).data("stock"));


        if (quantity >= stock) {

            alert(
                "You cannot add more than " +
                stock +
                " painting(s)."
            );

            return;
        }


        updateCartQuantity(
            productId,
            quantity + 1
        );

    });


    $(".decrease-quantity").click(function () {

        var productId =
            $(this).data("product");

        var quantity =
            parseInt($(this).data("quantity"));


        if (quantity <= 1) {

            return;
        }


        updateCartQuantity(
            productId,
            quantity - 1
        );

    });


    $(".remove-item-button").click(function () {

        var cartItemId =
            $(this).data("id");


        if (!confirm(
            "Remove this painting from your cart?"
        )) {

            return;
        }


        deleteCartItem(cartItemId);

    });


}

function updateCartQuantity(
    productId,
    quantity
) {

    $.ajax({

        url: API_BASE_URL + "/Cart/UpdateCart",

        type: "PUT",

        data: {

            userId: currentUser.UserId,

            productId: productId,

            quantity: quantity

        },

        xhrFields: {
            withCredentials: true
        },


        success: function (response) {

            if (
                response != null &&
                response.Success == false
            ) {

                alert(response.Message);

                return;
            }


            loadCart();

        },


        error: function (xhr) {

            console.log(
                "Update cart error:",
                xhr
            );

            alert(
                "Unable to update cart."
            );

        }

    });

}

function deleteCartItem(cartItemId) {

    $.ajax({

        url: API_BASE_URL +
            "/Cart/DeleteCartItem?userId=" +
            currentUser.UserId +
            "&cartItemId=" +
            cartItemId,

        type: "DELETE",

        xhrFields: {
            withCredentials: true
        },

        success: function (response) {

            console.log(
                "Delete response:",
                response
            );

            if (
                response != null &&
                response.Success == false
            ) {

                alert(response.Message);

                return;
            }

            loadCart();

        },

        error: function (xhr) {

            console.log(
                "Delete cart item error:",
                xhr.status,
                xhr.responseText,
                xhr
            );

            alert(
                "Unable to remove painting."
            );

        }

    });
}


function clearCart() {

    if (cartItems.length == 0) {
        return;
    }

    if (!confirm(
        "Are you sure you want to clear your cart?"
    )) {
        return;
    }

    $.ajax({

        url: API_BASE_URL +
            "/Cart/ClearCart?userId=" +
            currentUser.UserId,

        type: "DELETE",

        xhrFields: {
            withCredentials: true
        },

        success: function (response) {

            console.log(
                "Clear cart response:",
                response
            );

            if (
                response != null &&
                response.Success == false
            ) {

                alert(response.Message);

                return;
            }

            loadCart();

        },

        error: function (xhr) {

            console.log(
                "Clear cart error:",
                xhr.status,
                xhr.responseText,
                xhr
            );

            alert(
                "Unable to clear cart."
            );

        }

    });
}

function updateSummary() {


    var totalItems = 0;

    var subtotal = 0;


    $.each(cartItems, function (index, item) {

        totalItems +=
            parseInt(item.Quantity);

        subtotal +=
            parseInt(item.Price) *
            parseInt(item.Quantity);

    });


    var totalAmount = 0;


    if (totalItems > 0) {

        totalAmount =
            subtotal +
            SHIPPING_CHARGE;
    }


    $("#totalItems").text(totalItems);

    $("#subtotal").text(
        "₹" + subtotal
    );

    $("#shipping").text(
        totalItems > 0
            ? "₹" + SHIPPING_CHARGE
            : "₹0"
    );

    $("#totalAmount").text(
        "₹" + totalAmount
    );

}


function showEmptyCart() {


    $("#cartItemsContainer").empty();

    $("#emptyCart").removeClass("hidden");

}

function setupButtons() {


    $("#clearCartButton").click(function () {

        clearCart();

    });


    $("#checkoutButton").click(function () {

        if (cartItems.length == 0) {

            alert(
                "Your cart is empty."
            );

            return;
        }


        window.location.href =
            "payment.html";

    });

}

function escapeHtml(value) {
    if (value == null) {

        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
