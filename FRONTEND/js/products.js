$(document).ready(function () {
    loadPaintings();
    $("#sortProducts").change(function () {
        sortProducts($(this).val());
    });
});

var allPaintings = [];
var selectedCategoryId = 0;

function loadPaintings() {
    var categoryId = getCategoryFromUrl();
    selectedCategoryId = categoryId;

    $.ajax({
        url: "http://localhost:64867/api/Product",
        type: "GET",
        success: function (products) {
            if (products == null) {
                products = [];
            }
            allPaintings = products;
            loadCategoryFilters(function () {
                filterPaintings();
            });
        },
        error: function () {
            $("#productsContainer").html(`
                <div class="empty-message">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <h3>Unable to load paintings</h3>
                    <p>Something went wrong while loading the painting collection.</p>
                </div>`);
            $("#productCount").text("0 Paintings");
        }
    });
}

function getCategoryFromUrl() {
    var urlParams = new URLSearchParams(window.location.search);
    var category = urlParams.get("category");
    if (category == null || category === "") {
        return 0;
    }
    var categoryId = parseInt(category);

    if (isNaN(categoryId)) {
        return 0;
    }
    return categoryId;
}

function loadCategoryFilters(callback) {
    $.ajax({
        url: "http://localhost:64867/api/Category",
        type: "GET",
        success: function (categories) {
            var container = $("#categoryFilters");
            container.empty();
            container.append(`
                <button class="category-filter" data-category="0">
                    <i class="fa-solid fa-border-all"></i>
                    <span>All Paintings</span>
                </button>`);

            if (categories != null) {
                $.each(categories, function (index, category) {
                    var icon = getCategoryIcon(category.CategoryName);
                    container.append(`
                        <button class="category-filter" data-category="${category.CategoryId}">
                            <i class="${icon}"></i>
                            <span>${category.CategoryName}</span>
                        </button>`);
                });
            }
            setActiveCategory();
            $(".category-filter").click(function () {
                var categoryId = parseInt($(this).attr("data-category"));
                selectedCategoryId = categoryId;

                if (categoryId === 0) {
                    window.history.pushState({}, "", "products.html");
                }
                else {
                    window.history.pushState({}, "", "products.html?category=" + categoryId);
                }

                $(".category-filter").removeClass("active");
                $(this).addClass("active");
                filterPaintings();
            });

            if (callback) {
                callback();
            }
        },
        error: function () {
            if (callback) {
                callback();
            }
        }
    });
}

function setActiveCategory() {
    $(".category-filter").removeClass("active");
    var activeButton = $('.category-filter[data-category="' + selectedCategoryId + '"]');

    if (activeButton.length > 0) {
        activeButton.addClass("active");
    }
    else {
        selectedCategoryId = 0;
        $('.category-filter[data-category="0"]').addClass("active");
    }
}

function filterPaintings() {
    var filteredPaintings = [];
    if (selectedCategoryId === 0) {
        filteredPaintings = allPaintings.slice();
        $("#selectedCategory").text("All Paintings");
    }
    else {
        filteredPaintings = $.grep(allPaintings, function (product) {
                    return product.CategoryId == selectedCategoryId;
                }
            );

        var categoryName = getSelectedCategoryName();
        $("#selectedCategory").text(categoryName);
    }
    displayPaintings(filteredPaintings);
}

function getSelectedCategoryName() {
    var name = "Paintings";
    $(".category-filter").each(function () {
        var categoryId = parseInt($(this).attr("data-category"));
        if (categoryId === selectedCategoryId) {
            name = $(this).find("span").text();
            return false;
        }
    });
    return name;
}

function displayPaintings(products) {
    var container = $("#productsContainer");
    container.empty();
    $("#productCount").text(products.length + (products.length === 1 ? " Painting" : " Paintings"));

    if (products == null || products.length === 0) {
        container.html(`
            <div class="empty-message">
                <i class="fa-solid fa-palette"></i>
                <h3>No Paintings Found</h3>
                <p>There are no paintings available in this category.</p>
            </div>`);
        return;
    }

    $.each(products, function (index, product) {
        var stockClass = getStockClass(product.Quantity);
        var stockText = getStockText(product.Quantity);
        var categoryName = getCategoryNameByProduct(product.CategoryId);
        var buttonClass = "";
        var buttonText = "View Details";

        if (product.Quantity <= 0) {
            buttonClass = "disabled";
            buttonText = "Out of Stock";
        }

        container.append(`
            <div class="painting-card">
                <div class="painting-image-wrapper">
                    <img
                        src="${product.Image}"
                        alt="${product.ProductName}"
                        class="painting-image"
                        onerror="this.src='images/placeholder.jpg';">
                    <span class="category-badge">${categoryName}</span>
                    <span class="stock-badge ${stockClass}">${stockText}</span>
                </div>
                <div class="painting-info">
                    <h3>${product.ProductName}</h3>
                    <p class="painting-description">${product.Description}</p>
                    <div class="painting-bottom">
                        <span class="painting-price">₹${product.Price}</span>
                        <a href="product-details.html?id=${product.ProductId}" class="view-product-button ${buttonClass}">
                            ${buttonText}
                            ${product.Quantity > 0 ? '<i class="fa-solid fa-arrow-right"></i>' : ''}
                        </a>
                    </div>
                </div>
            </div>`);
    });
}

function sortProducts(sortType) {
    var products = getCurrentFilteredProducts();
    if (sortType === "low") {
        products.sort(function (a, b) {
            return a.Price - b.Price;
        });
    }
    else if (sortType === "high") {
        products.sort(function (a, b) {
            return b.Price - a.Price;
        });
    }
    else if (sortType === "name") {
        products.sort(function (a, b) {
            return a.ProductName.localeCompare(b.ProductName);
        });
    }
    displayPaintings(products);
}

function getCurrentFilteredProducts() {
    if (selectedCategoryId === 0) {
        return allPaintings.slice();
    }
    return $.grep(allPaintings, function (product) {
            return product.CategoryId == selectedCategoryId;
        }
    );
}

function getCategoryNameByProduct(categoryId) {
    var categoryName = "Painting";
    $(".category-filter").each(function () {
        var id = parseInt($(this).attr("data-category"));
        if (id === categoryId) {
            categoryName = $(this).find("span").text();
            return false;
        }
    });
    return categoryName;
}

function getCategoryIcon(categoryName) {
    var name = categoryName.toLowerCase();
    if (name.includes("nature")) {
        return "fa-solid fa-leaf";
    }

    if (name.includes("tribal")) {
        return "fa-solid fa-paintbrush";
    }

    if (name.includes("religious")) {
        return "fa-solid fa-hands-praying";
    }

    if (name.includes("monument")) {
        return "fa-solid fa-landmark";
    }
    return "fa-solid fa-palette";
}

function getStockClass(quantity) {
    if (quantity <= 0) {
        return "out-of-stock";
    }
    if (quantity <= 2) {
        return "low-stock";
    }
    return "";
}

function getStockText(quantity) {
    if (quantity <= 0) {
        return "Out of Stock";
    }
    if (quantity <= 2) {
        return "Only " + quantity + " left";
    }
    return "In Stock";
}