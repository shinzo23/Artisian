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

    $("#toggleConfirmPassword").click(function () {

        var passwordInput = $("#confirmPassword");
        var icon = $("#toggleConfirmPassword i");

        if (passwordInput.attr("type") === "password") {
            passwordInput.attr("type", "text");
            icon.removeClass("fa-eye");
            icon.addClass("fa-eye-slash");
            $("#toggleConfirmPassword").attr("title", "Hide password");
        }
        else {
            passwordInput.attr("type", "password");
            icon.removeClass("fa-eye-slash");
            icon.addClass("fa-eye");
            $("#toggleConfirmPassword").attr("title", "Show password");
        }
    });

    $("#signupForm").submit(function (event) {
        event.preventDefault();
        registerUser();
    });
});

function registerUser() {
    clearSignupErrors();
    var fullName = $.trim($("#fullName").val());
    var email = $.trim($("#email").val());
    var password = $("#password").val();
    var confirmPassword = $("#confirmPassword").val();
    var isValid = true;

    if (fullName === "") {
        $("#fullNameError").text("Full name is required.");
        isValid = false;
    }
    else if (fullName.length < 3) {
        $("#fullNameError").text("Full name must contain at least 3 characters.");
        isValid = false;
    }

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
    else if (password.length < 4) {
        $("#passwordError").text("Password must contain at least 4 characters.");
        isValid = false;
    }

    if (confirmPassword === "") {
        $("#confirmPasswordError").text("Please confirm your password.");
        isValid = false;
    }
    else if (password !== confirmPassword) {
        $("#confirmPasswordError").text("Passwords do not match.");
        isValid = false;
    }

    if (!isValid) {
        return;
    }

    $("#signupButton").prop("disabled", true);
    $("#signupButtonText").text("Creating Account...");
    $("#signupButtonIcon").removeClass("fa-user-plus").addClass("fa-spinner fa-spin");

    $.ajax({
        url: "http://localhost:64867/api/User",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            FullName: fullName,
            Email: email,
            Password: password
        }),
        xhrFields: {
            withCredentials: true
        },
        success: function (response) {
            showSignupMessage("Account created successfully.", "success");
            setTimeout(function () {
                alert("Account created successfully.");
                window.location.href = "login.html";
            }, 1200);
        },

        error: function (xhr) {
            console.log("Signup error:", xhr);
            if (xhr.responseText && xhr.responseText.toLowerCase().includes("duplicate")) {
                showSignupMessage("An account with this email already exists.", "error");
            }
            else {
                showSignupMessage("Unable to create your account. Please try again.", "error");
            }
            resetSignupButton();
        }
    });
}

function isValidEmail(email) {
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

function clearSignupErrors() {
    $("#fullNameError").text("");
    $("#emailError").text("");
    $("#passwordError").text("");
    $("#confirmPasswordError").text("");
    $("#signupMessage").removeClass("error success").hide().text("");
}

function showSignupMessage(message, type) {
    $("#signupMessage").removeClass("error success").addClass(type).text(message).show();
}

function resetSignupButton() {
    $("#signupButton").prop("disabled", false);
    $("#signupButtonText").text("Create Account");
    $("#signupButtonIcon").removeClass("fa-spinner fa-spin").addClass("fa-user-plus");
}