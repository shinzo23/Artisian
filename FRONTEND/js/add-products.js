var API_BASE_URL = "http://localhost:64867/api";

$(document).ready(function () {
    checkAdmin();
    setupDescriptionCounter();
    setupPaintingForm();
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
                window.location.href = "../login.html";
                return;
            }

            if (user.TypeId != 1) {
                alert("Access denied. Admin login required.");
                window.location.href = "../index.html";
                return;
            }

            $("#adminName").text(user.FullName);
            loadCategories();
        },
        error: function () {
            window.location.href = "../login.html";
        }
    });
}

function loadCategories() {
    $.ajax({
        url: API_BASE_URL + "/Category",
        type: "GET",
        success: function (categories) {
            var dropdown = $("#productCategory");
            dropdown.empty();
            dropdown.append(
                '<option value="">-- Select Category --</option>'
            );
            if (categories == null || categories.length == 0) {
                return;
            }
            $.each(categories, function (index, category) {
                dropdown.append(
                    '<option value="' +
                    category.CategoryId +
                    '">' +
                    category.CategoryName +
                    '</option>'
                );
            });
        },
        error: function () {
            $("#productCategory").empty();
            $("#productCategory").append(
                '<option value="">Unable to load categories</option>'
            );
        }
    });
}

function setupDescriptionCounter() {
    $("#productDescription").on("input", function () {
        var length = $(this).val().length;
        $("#descriptionCount").text(length);
    });
}


function setupPaintingForm() {
    $("#paintingForm").submit(function (event) {
        event.preventDefault();
        var productName =
            $.trim($("#productName").val());
        var productPrice =
            $("#productPrice").val();
        var productQuantity =
            $("#productQuantity").val();
        var categoryId =
            $("#productCategory").val();
        var image =
            $.trim($("#productImage").val());
        var description =
            $.trim($("#productDescription").val());
        hideFormMessage();
        if (productName == "") {
            showFormMessage(
                "Please enter the painting name.",
                "error"
            );
            $("#productName").focus();
            return;
        }

        if (productPrice == "" ||
            parseInt(productPrice) <= 0) {
            showFormMessage(
                "Please enter a valid price.",
                "error"
            );
            $("#productPrice").focus();
            return;
        }

        if (productQuantity == "" ||
            parseInt(productQuantity) < 0) {
            showFormMessage(
                "Please enter a valid stock quantity.",
                "error"
            );
            $("#productQuantity").focus();
            return;
        }
        if (categoryId == "") {
            showFormMessage(
                "Please select a category.",
                "error"
            );
            $("#productCategory").focus();
            return;
        }
        if (image == "") {
            showFormMessage(
                "Please enter the painting image path.",
                "error"
            );
            $("#productImage").focus();
            return;
        }
        if (description == "") {
            showFormMessage(
                "Please enter a painting description.",
                "error"
            );
            $("#productDescription").focus();
            return;
        }

        var product = {
            ProductName: productName,
            Price: parseInt(productPrice),
            Image: image,
            Quantity: parseInt(productQuantity),
            CategoryId: parseInt(categoryId),
            Description: description
        };

        var button = $(".save-button");
        button.prop("disabled", true);
        button.html(
            '<i class="fa-solid fa-spinner fa-spin"></i> Adding...'
        );

        $.ajax({
            url: API_BASE_URL + "/Product/PostProduct",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(product),
            xhrFields: {
                withCredentials: true
            },

            success: function (newProduct) {
                showFormMessage(
                    "Painting added successfully.",
                    "success"
                );
                $("#paintingForm")[0].reset();
                $("#descriptionCount").text("0");
                button.prop("disabled", false);
                button.html(
                    '<i class="fa-solid fa-plus"></i> Add Painting'
                );

                setTimeout(function () {
                    window.location.href = "admin-dashboard.html";
                }, 1200);
            },

            error: function (xhr) {
                button.prop("disabled", false);
                button.html(
                    '<i class="fa-solid fa-plus"></i> Add Painting'
                );
                var message =
                    "Unable to add painting.";

                if (xhr.responseJSON != null) {
                    if (xhr.responseJSON.Message != null) {
                        message =
                            xhr.responseJSON.Message;
                    }
                }
                if (xhr.status == 500) {
                    message =
                        "Painting could not be added. " +
                        "The painting name or image path may already exist.";
                }
                showFormMessage(
                    message,
                    "error"
                );
            }
        });
    });
}

function showFormMessage(message, type) {
    var messageBox = $("#formMessage");
    messageBox
        .removeClass("success error")
        .addClass(type)
        .html(
            '<i class="fa-solid ' +
            (type == "success"
                ? "fa-circle-check"
                : "fa-circle-exclamation") +
            '"></i> ' +
            message
        )
        .show();
}

function hideFormMessage() {
    $("#formMessage").removeClass("success error").hide().html("");
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