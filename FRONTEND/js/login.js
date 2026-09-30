$(document).ready(function () {

    $("#togglePassword").click(function () {

        var passwordInput = $("#password");
        var icon = $("#togglePassword i");

        if (passwordInput.attr("type") === "password") {
            passwordInput.attr("type", "text");
            icon.removeClass("fa-eye");
            icon.addClass("fa-eye-slash");
            $("#togglePassword").attr("title", "Hide password");
        }
        else {
            passwordInput.attr("type", "password");
            icon.removeClass("fa-eye-slash");
            icon.addClass("fa-eye");
            $("#togglePassword").attr("title", "Show password");
        }
    });

    $("#loginForm").submit(function (event) {
        event.preventDefault();
        loginUser();
    });
});

function loginUser() {

    clearLoginErrors();

    var email = $.trim($("#email").val());
    var password = $("#password").val();

    var isValid = true;

    if (email === "") {
        $("#emailError").text("Email address is required.");
        isValid = false;
    }
    else if (!isValidEmail(email)) {
        $("#emailError").text("Please enter a valid email address.");
        isValid = false;
    }

    if (password === "") {
        $("#passwordError").text("Password is required.");
        isValid = false;
    }

    if (!isValid) {
        return;
    }

    $("#loginButton").prop("disabled", true);
    $("#loginButtonText").text("Signing In...");
    $("#loginButtonIcon").removeClass("fa-arrow-right").addClass("fa-spinner fa-spin");

    $.ajax({
        url: "http://localhost:64867/api/User/GetUser",
        type: "GET",
        data: {
            email: email,
            password: password
        },
        xhrFields: {
            withCredentials: true
        },
        success: function (user) {
            if (user == null) {
                showLoginMessage("Invalid email or password.", "error");
                resetLoginButton();
                return;
            }

            showLoginMessage("Login successful.", "success");
            if (user.TypeId == 1) {
                setTimeout(function () {
                    window.location.href = "admin-dashboard.html";
                }, 500);
            }
            else {
                alert("Login successful.");
                setTimeout(function () {
                    window.location.href = "index.html";
                }, 500);
            }
        },
        error: function (xhr) {
            console.log("Login error:", xhr);
            showLoginMessage("Unable to login right now. Please try again.", "error");
            resetLoginButton();
        }
    });
}

function isValidEmail(email) {
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

function clearLoginErrors() {
    $("#emailError").text("");
    $("#passwordError").text("");
    $("#loginMessage").removeClass("error success").hide().text("");
}

function showLoginMessage(message, type) {
    $("#loginMessage").removeClass("error success").addClass(type).text(message).show();
}

function resetLoginButton() {
    $("#loginButton").prop("disabled", false);
    $("#loginButtonText").text("Sign In");
    $("#loginButtonIcon").removeClass("fa-spinner fa-spin").addClass("fa-arrow-right");
}