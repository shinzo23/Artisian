$(document).ready(function () {
    setupCategoryDropdown();
    setupUserDropdown();
    setupSearch();
    checkCurrentUser();
    loadCategories();
    updateCartCount();
});

function setupCategoryDropdown() {
    $("#categoryButton").click(function (event) {
        event.stopPropagation();
        $("#categoryDropdown").toggleClass("show");
        $("#categoryButton").toggleClass("active");
        $("#userDropdown").removeClass("show");
        $("#userButton").removeClass("active");
    });

    $(document).click(function () {
        $("#categoryDropdown").removeClass("show");
        $("#categoryButton").removeClass("active");
    });
}

function loadCategories() {
    $.ajax({
        url: "http://localhost:64867/api/Category",
        type: "GET",
        success: function (categories) {
            var dropdown = $("#categoryDropdown");
            dropdown.empty();

            $.each(categories, function (index, category) {
                var icon = getCategoryIcon(category.CategoryName);
                dropdown.append(`
                    <a href="products.html?category=${category.CategoryId}">
                        <i class="${icon}"></i>
                        <span>${category.CategoryName}</span>
                    </a>`);
            });
        },

        error: function () {
            console.log("Unable to load categories.");
        }
    });
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

function setupUserDropdown() {
    $("#userButton").click(function (event) {
        event.stopPropagation();
        $("#userDropdown").toggleClass("show");
        $("#userButton").toggleClass("active");
        $("#categoryDropdown").removeClass("show");
        $("#categoryButton").removeClass("active");
    });

    $(document).click(function () {
        $("#userDropdown").removeClass("show");
        $("#userButton").removeClass("active");
    });

    $("#userDropdown").click(function (event) {
        event.stopPropagation();
    });

    $("#logoutButton").click(function () {
        logoutUser();
    });
}

function checkCurrentUser() {
    $.ajax({
        url: "http://localhost:64867/api/User/GetCurrentUser",
        type: "GET",
        xhrFields: {
            withCredentials: true
        },
        success: function (user) {
            if (user != null) {
                $("#usernameText").text(user.FullName);
                $("#currentUserName").text(user.FullName);
                $("#userButton").show();
                $("#loginButton").hide();
            }
            else {
                $("#usernameText").text("Account");
                $("#currentUserName").text("User");
                $("#userButton").hide();
                $("#loginButton").show();
            }
        },
        error: function () {
            $("#userButton").hide();
            $("#loginButton").show();
        }
    });
}

function logoutUser() {
    $.ajax({
        url: "http://localhost:64867/api/User/Logout",
        type: "GET",
        xhrFields: {
            withCredentials: true
        },
        success: function () {
            window.location.href = "login.html";
        },
        error: function () {
            alert("Unable to logout.");
        }
    });
}

function setupSearch() {
    $("#searchButton").click(function () {
        $("#searchBox").toggleClass("show");

        if ($("#searchBox").hasClass("show")) {
            $("#searchInput").focus();
        }
    });

    $("#closeSearch").click(function () {
        $("#searchInput").val("");
        $("#searchBox").removeClass("show");
    });

    $("#searchInput").keypress(function (event) {
        if (event.which === 13) {
            var searchText = $(this).val().trim();

            if (searchText !== "") {
                window.location.href = "products.html?search=" + encodeURIComponent(searchText);
            }
        }
    });
}

function updateCartCount() {
    $.ajax({
        url: "http://localhost:64867/api/User/GetCurrentUser",
        type: "GET",
        xhrFields: {
            withCredentials: true
        },
        success: function (user) {
            if (user == null) {
                $("#cartCount").text("0");
                return;
            }

            $.ajax({
                url: "http://localhost:64867/api/Cart/GetCartItems",
                type: "GET",
                data: {
                    userId: user.UserId
                },
                xhrFields: {
                    withCredentials: true
                },
                success: function (items) {
                    var totalQuantity = 0;
                    $.each(items, function (index, item) {
                        totalQuantity += item.Quantity;
                    });

                    $("#cartCount").text(totalQuantity);
                },
                error: function () {
                    $("#cartCount").text("0");
                }
            });
        },
        error: function () {
            $("#cartCount").text("0");
        }
    });
}