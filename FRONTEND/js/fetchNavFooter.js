// ! Fetch Navbar 
fetch("navbar.html")
  .then(response => response.text())
  .then(data => {
    document.getElementById("navbar").innerHTML = data;
    checkAdmin();
    setupCategoryDropdown();
    setupUserDropdown();
    setupSearch();
    checkCurrentUser();
    loadCategories();
    updateCartCount();
  })
  .catch(error => console.log("Error loading navbar:", error));

function checkAdmin() {
  $.ajax({
    url: "http://localhost:64867/api/User/GetCurrentUser",
    type: "GET",
    xhrFields: {
      withCredentials: true
    },
    success: function (user) {
      if (user != null && user.TypeId == 1) {
        $("#adminDashboardLink").show();
      } else {
        $("#adminDashboardLink").hide();
      }
    },

    error: function () {
      $("#adminDashboardLink").hide();
    }
  });
}

// ! Fetch Footer 
fetch("footer.html")
  .then(response => response.text())
  .then(data => {
    document.getElementById("page-footer").innerHTML = data;
  })
  .catch(error => console.log("Error loading footer:", error));