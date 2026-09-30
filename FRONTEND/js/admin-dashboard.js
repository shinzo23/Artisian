var API_BASE_URL = "http://localhost:64867/api";

var products = [];
var orders = [];
var users = [];
var categories = [];

$(document).ready(function () {
    checkAdmin();
    setupNavigation();
    setupDropdowns();
    setupLogout();
});

function checkAdmin() {
    $.ajax({
        url: API_BASE_URL + "/User/GetCurrentUser",
        type: "GET",
        xhrFields: {
            withCredentials: true
        },
        success: function (user) {
            if (user == null) {
                window.location.href = "./login.html";
                return;
            }
            if (user.TypeId != 1) {
                alert("Access denied. Admin login required.");
                window.location.href = "./index.html";
                return;
            }

            $("#adminName").text(user.FullName);
            loadDashboardData();
        },
        error: function () {
            window.location.href = "./login.html";
        }
    });
}

function setupNavigation() {
    $(".admin-nav-item").click(function () {
        var sectionName = $(this).data("section");
        $(".admin-nav-item").removeClass("active");
        $(this).addClass("active");
        $(".admin-section").removeClass("active");
        $("#" + sectionName + "Section").addClass("active");
        updatePageTitle(sectionName);
    });
}

function updatePageTitle(sectionName) {
    var title = "Dashboard";
    if (sectionName == "products") {
        title = "Products";
    }
    if (sectionName == "orders") {
        title = "Orders";
    }
    if (sectionName == "users") {
        title = "Users";
    }
    if (sectionName == "add-painting") {
        title = "Add Painting";
    }
    $("#pageTitle").text(title);
}

function loadDashboardData() {
    loadCategories();
    loadProducts();
    loadOrders();
    loadUsers();
}

function loadCategories() {
    $.ajax({
        url: API_BASE_URL + "/Category",
        type: "GET",
        success: function (data) {
            categories = data || [];
        },
        error: function () {
            categories = [];
        }
    });
}

function loadProducts() {
    $.ajax({
        url: API_BASE_URL + "/Product",
        type: "GET",
        success: function (data) {
            products = data || [];
            $("#productCount").text(products.length);
            var dropdown = $("#productDropdown");
            dropdown.empty();
            dropdown.append('<option value="">-- Select a painting --</option>');
            $.each(products, function (index, product) {
                dropdown.append('<option value="' + product.ProductId + '">' + product.ProductName + '</option>');
            });
        },
        error: function () {
            products = [];
            $("#productCount").text("-");
            $("#productDropdown").empty();
            $("#productDropdown").append('<option value="">Unable to load paintings</option>');
        }
    });
}

function loadOrders() {
    $.ajax({
        url: API_BASE_URL + "/Order/GetAllOrders",
        type: "GET",
        xhrFields: {
            withCredentials: true
        },
        success: function (data) {
            if (data != null && data.Message != null) {
                orders = [];
                $("#orderCount").text("-");
                $("#orderDropdown").empty();
                $("#orderDropdown").append('<option value="">-- Unable to load orders --</option>');
                return;
            }
            orders = data || [];
            $("#orderCount").text(orders.length);
            var dropdown = $("#orderDropdown");
            dropdown.empty();
            dropdown.append('<option value="">-- Select an order --</option>');
            $.each(orders, function (index, order) {
                dropdown.append(
                    '<option value="' +
                    order.OrderId +
                    '">' +
                    "Order #" +
                    order.OrderId +
                    " - User #" +
                    order.UserId +
                    '</option>'
                );
            });
        },
        error: function () {
            orders = [];
            $("#orderCount").text("-");
            $("#orderDropdown").empty();
            $("#orderDropdown").append('<option value="">Unable to load orders</option>');
        }
    });
}

function loadUsers() {
    $.ajax({
        url: API_BASE_URL + "/User/GetAllUsers",
        type: "GET",
        xhrFields: {
            withCredentials: true
        },
        success: function (data) {
            if (data != null && data.Message != null) {
                users = [];
                $("#userCount").text("-");
                $("#userDropdown").empty();
                $("#userDropdown").append(
                    '<option value="">-- Unable to load users --</option>'
                );
                return;
            }
            users = data || [];
            $("#userCount").text(users.length);
            var dropdown = $("#userDropdown");
            dropdown.empty();
            dropdown.append('<option value="">-- Select a user --</option>');
            $.each(users, function (index, user) {
                dropdown.append(
                    '<option value="' +
                    user.UserId +
                    '">' +
                    user.FullName +
                    " - " +
                    user.Email +
                    '</option>'
                );
            });
        },
        error: function () {
            users = [];
            $("#userCount").text("-");
            $("#userDropdown").empty();
            $("#userDropdown").append('<option value="">Unable to load users</option>');
        }
    });
}

function setupDropdowns() {
    $("#productDropdown").change(function () {
        var productId = $(this).val();
        if (productId == "") {
            $("#productDetails").addClass("hidden");
            return;
        }
        showSelectedProduct(productId);
    });

    $("#orderDropdown").change(function () {
        var orderId = $(this).val();
        if (orderId == "") {
            $("#orderDetails").addClass("hidden");
            return;
        }
        showSelectedOrder(orderId);
    });

    $("#userDropdown").change(function () {
        var userId = $(this).val();
        if (userId == "") {
            $("#userDetails").addClass("hidden");
            return;
        }
        showSelectedUser(userId);
    });
}

function showSelectedProduct(productId) {
    var selectedProduct = null;
    $.each(products, function (index, product) {
        if (product.ProductId == productId) {
            selectedProduct = product;
            return false;
        }
    });

    if (selectedProduct == null) {
        $("#productDetails").addClass("hidden");
        return;
    }

    $("#selectedProductId").text(selectedProduct.ProductId);
    $("#selectedProductName").text(selectedProduct.ProductName);
    $("#selectedProductPrice").text("₹" + selectedProduct.Price);
    $("#selectedProductQuantity").text(selectedProduct.Quantity);
    $("#selectedProductDescription").text(selectedProduct.Description);

    if (selectedProduct.Image != null &&
        selectedProduct.Image != "") {
        $("#selectedProductImage").attr("src", "./" + selectedProduct.Image);
    } else {
        $("#selectedProductImage").attr("src", "./images/no-image.png");
    }

    var categoryName = "Unknown";
    $.each(categories, function (index, category) {
        if (category.CategoryId == selectedProduct.CategoryId) {
            categoryName = category.CategoryName;
            return false;
        }
    });

    $("#selectedProductCategory").text(categoryName);
    $("#productDetails").removeClass("hidden");
}

function showSelectedOrder(orderId) {
    var selectedOrder = null;
    $.each(orders, function (index, order) {
        if (order.OrderId == orderId) {
            selectedOrder = order;
            return false;
        }
    });

    if (selectedOrder == null) {
        $("#orderDetails").addClass("hidden");
        return;
    }
    $("#selectedOrderId").text(selectedOrder.OrderId);
    $("#selectedOrderUserId").text(selectedOrder.UserId);
    var totalItems = selectedOrder.TotalItems;
    if (totalItems == null) {
        totalItems = 0;
    }
    var totalAmount = selectedOrder.TotalAmount;
    if (totalAmount == null) {
        totalAmount = 0;
    }
    $("#selectedOrderItems").text(totalItems);
    $("#selectedOrderTotal").text("₹" + totalAmount);
    $("#orderDetails").removeClass("hidden");
}

function showSelectedUser(userId) {
    var selectedUser = null;
    $.each(users, function (index, user) {
        if (user.UserId == userId) {
            selectedUser = user;
            return false;
        }
    });

    if (selectedUser == null) {
        $("#userDetails").addClass("hidden");
        return;
    }
    $("#selectedUserId").text(selectedUser.UserId);
    $("#selectedUserName").text(selectedUser.FullName);
    $("#selectedUserEmail").text(selectedUser.Email);
    if (selectedUser.TypeId == 1) {
        $("#selectedUserType").text("Admin");
    } else {
        $("#selectedUserType").text("User");
    }
    $("#userDetails").removeClass("hidden");
}

function setupLogout() {
    $("#logoutButton").click(function () {
        $.ajax({
            url: API_BASE_URL + "/User/Logout",
            type: "GET",
            xhrFields: {
                withCredentials: true
            },
            success: function () {
                window.location.href = "./login.html";
            },
            error: function () {
                window.location.href = "./login.html";
            }
        });
    });
}