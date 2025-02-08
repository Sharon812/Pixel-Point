let currentProductCount = 6;

function submitFilters() {
  document.getElementById("filtersForm").submit();
}

function clearFilters() {
  document.getElementById("search").value = "";
  document.getElementById("category").value = "";
  document.getElementById("brand").value = "";
  document.getElementById("priceRange").value = "";
  document.getElementById("ram").value = "";
  document.getElementById("storage").value = "";
  document.getElementById("color").value = "";
  document
    .querySelectorAll('input[name="sort"]')
    .forEach((input) => (input.checked = false));
  document.getElementById("filtersForm").submit();
}

async function addToCart(productId, comboId) {
  const quantity = 1;
  const route = `/addCart/${productId}/combo/${comboId}`;

  try {
    // Send a fetch request to the server
    const response = await fetch(route, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quantity }),
    });

    const result = await response.json();

    if (response.ok) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Item added to Cart !",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        customClass: {
          popup: "colored-toast",
          icon: "success-icon",
        },
      });
    } else {
      // Error toast for server-side issues
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Error!",
        text: "An error occurred. Please try again.",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: "colored-toast error-toast",
          icon: "error-icon",
        },
      });
    }
  } catch (error) {
    // Error toast for client-side/network issues
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "error",
      title: "Something went wrong. Please try again later!",
      showConfirmButton: false,
      timer: 3000,
    });
    console.error("Error adding to cart:", error);
  }
}

async function toggleWishlist(productId) {
  const route = `/addToWishlist`;

  try {
    // Send a fetch request to the server
    const response = await fetch(route, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId }),
    });

    const result = await response.json();

    if (response.ok) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Item added to Wishlist !",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        customClass: {
          popup: "colored-toast",
          icon: "success-icon",
        },
      }).then(() => {
        window.location.reload();
      });
    } else {
      // Error toast for server-side issues
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Error!",
        text: result.message || "An error occurred. Please try again.",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: "colored-toast error-toast",
          icon: "error-icon",
        },
      });
    }
  } catch (error) {
    // Error toast for client-side/network issues
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "error",
      title: "Something went wrong. Please try again later!",
      showConfirmButton: false,
      timer: 3000,
    });
    console.error("Error adding to cart:", error);
  }
}

async function removeFromWishlist(productId) {
  const route = `/removeFromWishlist`;

  try {
    // Send a fetch request to the server
    const response = await fetch(route, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId }),
    });

    const result = await response.json();

    if (response.ok) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Item Removed From Wishlist!",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        customClass: {
          popup: "colored-toast",
          icon: "success-icon",
        },
      }).then(() => {
        window.location.reload();
      });
    } else {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Error!",
        text: result.message || "An error occurred. Please try again.",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: "colored-toast error-toast",
          icon: "error-icon",
        },
      });
    }
  } catch (error) {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "error",
      title: "Something went wrong. Please try again later!",
      showConfirmButton: false,
      timer: 3000,
    });
    console.error("Error removing from wishlist:", error);
  }
}

function toggleFilters() {
  const filtersSection = document.querySelector(".filters-section");
  filtersSection.classList.toggle("show");
}

function toggleSort() {
  const sortDropdown = document.querySelector(".mobile-sort-dropdown");
  sortDropdown.classList.toggle("show");

  // Close dropdown when clicking outside
  document.addEventListener("click", function (event) {
    const sortSection = document.querySelector(".mobile-sort-section");
    if (!sortSection.contains(event.target)) {
      sortDropdown.classList.remove("show");
    }
  });
}

// Close filters when clicking outside on mobile
document.addEventListener("click", function (event) {
  const filtersSection = document.querySelector(".filters-section");
  const filterToggleBtn = document.querySelector(".filter-toggle-btn");

  if (
    !filtersSection.contains(event.target) &&
    !filterToggleBtn.contains(event.target)
  ) {
    filtersSection.classList.remove("show");
  }
});
