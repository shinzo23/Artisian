$(document).ready(function () {
    loadProduct();
    $(document).on("click", "#increaseQuantity", function () {
        var input = $("#quantityInput");
        var current = parseInt(input.val()) || 1;
        var max = parseInt(input.attr("max")) || 1;
        if (current < max) {
            input.val(current + 1);
        }
    }
    );

    $(document).on("click", "#decreaseQuantity", function () {
        var input = $("#quantityInput");
        var current = parseInt(input.val()) || 1;
        if (current > 1) {
            input.val(current - 1);
        }
    }
    );

    $(document).on("change", "#quantityInput", function () {
        var input = $("#quantityInput");
        var quantity = parseInt(input.val()) || 1;
        var max = parseInt(input.attr("max")) || 1;
        if (quantity < 1) {
            quantity = 1;
        }
        if (quantity > max) {
            quantity = max;
        }
        input.val(quantity);
    }
    );

    $(document).on("click", "#addToCartButton", function () {
        addProductToCart();
    }
    );
});

function getProductId() {
    var urlParams = new URLSearchParams(window.location.search);
    var id = urlParams.get("id");

    if (id == null || id === "") {
        return 0;
    }

    var productId = parseInt(id);

    if (isNaN(productId)) {
        return 0;
    }
    return productId;
}

function loadProduct() {
    var productId = getProductId();

    if (productId === 0) {
        showProductError("Invalid Painting", "The painting you are looking for could not be found.");
        return;
    }

    $.ajax({
        url: "http://localhost:64867/api/Product",
        type: "GET",
        success: function (products) {
            if (
                products == null || products.length === 0) {
                showProductError("Painting Not Found", "No paintings are currently available.");
                return;
            }
            var product = null;

            $.each(products, function (index, item) {
                if (
                    item.ProductId == productId) {
                    product = item;
                    return false;
                }
            }
            );

            if (product == null) {
                showProductError("Painting Not Found", "The painting you are looking for does not exist.");
                return;
            }
            loadProductCategory(product);
        },
        error: function (xhr) {
            console.log("Product loading error:", xhr);
            showProductError("Unable to Load Painting", "Something went wrong...");
        }
    });
}

function loadProductCategory(product) {
    $.ajax({
        url: "http://localhost:64867/api/Category",
        type: "GET",
        success: function (categories) {
            var categoryName = "Painting";

            $.each(categories, function (index, category) {
                if (category.CategoryId == product.CategoryId) {
                    categoryName = category.CategoryName;
                    return false;
                }
            }
            );
            displayProduct(product, categoryName);
        },
        error: function () {
            displayProduct(product, "Painting");
        }
    });
}

function displayProduct(product, categoryName) {
    var stockText = getProductStockText(product.Quantity);
    var stockClass = getProductStockClass(product.Quantity);
    var isOutOfStock = product.Quantity <= 0;
    var maxQuantity = product.Quantity > 0 ? product.Quantity : 1;
    var buttonDisabled = isOutOfStock ? "disabled" : "";

    $("#productDetails").html(`
        <div class="product-image-section">
            <div class="product-image-frame">
                <img src="${product.Image}" alt="${product.ProductName}" class="product-main-image">
                <span class="image-category">${categoryName}</span>
            </div>
        </div>
        <div class="product-info-section">
            <span class="product-label">ARTISIAN ORIGINAL</span>
            <h1>${product.ProductName}</h1>
            <p class="product-description">${product.Description}</p>
            <div class="product-price-section">
                <span class="price-label">Price</span>
                <span class="product-price">₹${product.Price}</span>
            </div>
            <div class="product-stock ${stockClass}">
                <i class="fa-solid
                    ${isOutOfStock ? "fa-circle-xmark" : "fa-circle-check"}">
                </i>
                <span>${stockText}</span>
            </div>
            <div class="quantity-section">
                <label for="quantityInput" class="quantity-label">Quantity</label>
                <div class="quantity-control">
                    <button type="button" id="decreaseQuantity" class="quantity-button">
                        <i class="fa-solid fa-minus"></i>
                    </button>
                    <input type="number" id="quantityInput" value="1" min="1" max="${maxQuantity}">
                    <button type="button" id="increaseQuantity" class="quantity-button">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>
            </div>
            <button type="button" id="addToCartButton" class="add-cart-button" ${buttonDisabled}>
                <i class="fa-solid fa-cart-plus"></i>
                ${isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
            <div id="productMessage" class="product-message">
            </div>
            <a href="products.html" class="back-paintings">
                <i class="fa-solid fa-arrow-left"></i>
                Back to Paintings
            </a>
        </div>`);
}

function addProductToCart() {
    var productId = getProductId();
    var quantity = parseInt($("#quantityInput").val()) || 1;

    if (productId === 0) {
        showProductMessage("Invalid painting.", "error");
        return;
    }

    if (quantity <= 0) {
        showProductMessage("Please select a valid quantity.", "error");
        return;
    }

    $.ajax({
        url: "http://localhost:64867/api/User/GetCurrentUser",
        type: "GET",
        xhrFields: {
            withCredentials: true
        },
        success: function (user) {
            if (user == null) {
                showProductMessage("Please login before adding a painting to your cart.", "error");
                setTimeout(function () {
                    window.location.href = "login.html";
                }, 1000);
                return;
            }
            addCartItem(user.UserId, productId, quantity);
        },
        error: function (xhr) {
            console.log("Current user error:", xhr);
            showProductMessage("Please login before adding a painting to your cart.", "error");
        }
    });
}

function addCartItem(userId, productId, quantity) {
    var button = $("#addToCartButton");
    button.prop("disabled", true);
    button.html(`<i class="fa-solid fa-spinner fa-spin"></i>Adding...`);


    $.ajax({
        url: "http://localhost:64867/api/Cart/PostCart",
        type: "POST",
        contentType: "application/json; charset=utf-8",

        data: JSON.stringify({
            userId: userId,
            productId: productId,
            quantity: quantity
        }),

        xhrFields: {
            withCredentials: true
        },

        success: function (response) {

            if (response != null && response.Success == false) {
                showProductMessage(response.Message, "error");
                restoreCartButton();
                return;
            }

            showProductMessage(
                "Painting added to your cart successfully.",
                "success"
            );

            updateCartCount();

            var button = $("#addToCartButton");

            button.html(
                `<i class="fa-solid fa-check"></i>Added to Cart`
            );

            setTimeout(function () {
                restoreCartButton();
            }, 1200);
        },

        error: function (xhr) {

            console.log("Add to cart error:", xhr);
            console.log("Response:", xhr.responseText);

            showProductMessage(
                "Unable to add the painting to your cart.",
                "error"
            );

            restoreCartButton();
        }
    });


}

function restoreCartButton() {
    var quantity = parseInt($("#quantityInput").attr("max")) || 0;
    if (quantity <= 0) {
        $("#addToCartButton").prop("disabled", true).html(`<i class="fa-solid fa-ban"></i>Out of Stock`);
        return;
    }
    $("#addToCartButton").prop("disabled", false).html(`<i class="fa-solid fa-cart-plus"></i>Add to Cart`);
}

function getProductStockText(quantity) {
    if (quantity <= 0) {
        return "Out of Stock";
    }
    if (quantity === 1) {
        return "Only 1 painting left";
    }
    // if (quantity <= 3) {
    //     return "Only " + quantity + " paintings left";
    // }
    return "In Stock";
}

function getProductStockClass(quantity) {
    if (quantity <= 0) {
        return "out";
    }
    if (quantity <= 3) {
        return "low";
    }
    return "available";
}

function showProductError(title, message) {
    $("#productDetails").html(`
        <div class="product-error">
            <i class="fa-solid fa-palette"></i>
            <h2>${title}</h2>
            <p>${message}</p>
            <a href="products.html">
                <i class="fa-solid fa-arrow-left"></i>
                Back to Paintings
            </a>
        </div>`);
}

function showProductMessage(message, type) {
    $("#productMessage").removeClass("error success").addClass(type).text(message).show();
}