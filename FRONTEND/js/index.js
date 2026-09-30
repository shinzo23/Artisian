$(document).ready(function () {
    loadHomeData();
});

function loadHomeData() {
    $.ajax({
        url: "http://localhost:64867/api/Category",
        type: "GET",
        success: function (categories) {
            displayHomeCategories(categories);
            loadFeaturedProducts(categories);
        },
        error: function () {
            $("#categoryCards").html(`
                <div class="loading-message">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    Unable to load categories.
                </div>`);
            loadFeaturedProducts([]);
        }
    });
}

function displayHomeCategories(categories) {
    var container = $("#categoryCards");
    container.empty();

    if (categories == null || categories.length == 0) {
        container.html(`
            <div class="loading-message">
                <i class="fa-solid fa-circle-exclamation"></i>
                No categories available.
            </div>`);
        return;
    }

    $.each(categories, function (index, category) {
        var icon = getHomeCategoryIcon(category.CategoryName);
        var description = getCategoryDescription(category.CategoryName);

        container.append(`
            <a href="products.html?category=${category.CategoryId}"
               class="category-card">
                <div class="category-card-icon">
                    <i class="${icon}"></i>
                </div>
                <h3>${category.CategoryName}</h3>
                <p>${description}</p>
                <span class="category-card-arrow">
                    <i class="fa-solid fa-arrow-right"></i>
                </span>
            </a>`);
    });
}

function loadFeaturedProducts(categories) {

    $.ajax({
        url: "http://localhost:64867/api/Product",
        type: "GET",
        success: function (products) {
            var container = $("#featuredProducts");
            container.empty();
            if (products == null || products.length == 0) {
                container.html(`
                    <div class="loading-message">
                        <i class="fa-solid fa-palette"></i>
                        No paintings available.
                    </div>`);
                return;
            }

            var displayProducts = products.slice(3, 7);

            $.each(displayProducts, function (index, product) {
                    var categoryName = getProductCategoryName(categories, product.CategoryId);

                    container.append(`
                        <div class="home-product-card">
                            <div class="product-image">
                                <img src="${product.Image}" alt="${product.ProductName}">
                                <span class="product-category">${categoryName}</span>
                            </div>
                            <div class="product-info">
                                <h3>${product.ProductName}</h3>
                                <p class="product-description">${product.Description}</p>
                                <div class="product-bottom">
                                    <span class="product-price">₹${product.Price}</span>
                                    <a href="product-details.html?id=${product.ProductId}" class="product-view-button">
                                        View
                                        <i class="fa-solid fa-arrow-right"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    `);
                }
            );
        },
        error: function () {
            $("#featuredProducts").html(`
                <div class="loading-message">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    Unable to load paintings.
                </div>`);
        }
    });
}

function getProductCategoryName(categories, categoryId) {
    var categoryName = "Painting";
    $.each(categories, function (index, category) {
        if (category.CategoryId == categoryId) {
            categoryName = category.CategoryName;
            return false;
        }
    });
    return categoryName;
}

function getHomeCategoryIcon(categoryName) {
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

function getCategoryDescription(categoryName) {
    var name = categoryName.toLowerCase();

    if (name.includes("nature")) {
        return "Beautiful artwork inspired by nature.";
    }

    if (name.includes("tribal")) {
        return "Traditional Indian tribal artwork.";
    }

    if (name.includes("religious")) {
        return "Spiritual paintings full of meaning.";
    }

    if (name.includes("monument")) {
        return "Artwork inspired by iconic places.";
    }
    return "Explore beautiful artistic creations.";
}