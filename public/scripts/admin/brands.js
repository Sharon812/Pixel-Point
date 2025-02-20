// Set current date
document.getElementById("currentDate").textContent =
  new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

// Mobile sidebar toggle
document.getElementById("sidebarToggle")?.addEventListener("click", () => {
  document.getElementById("sidebar").classList.add("show");
});

document.getElementById("sidebarClose")?.addEventListener("click", () => {
  document.getElementById("sidebar").classList.remove("show");
});

async function blockBrand(brandid) {
  console.log("hey");
  const route = `/admin/blockBrand?id=${brandid}`;
  try {
    // Send a fetch request to the server
    const response = await fetch(route, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    console.log(result);
    if (response.ok && result.success) {
      const element = document.getElementById(
        `badge-${result.updatedBrand.brandName}`
      );
      element.textContent = "Inactive";
      element.className = "badge bg-danger";
      const icon = document.getElementById(
        `icon-${result.updatedBrand.brandName}`
      );
    const brandId = icon.getAttribute(`data-id-${result.updatedBrand.brandName}`);
    icon.outerHTML = `  <button
    id="icon"
     onclick="unblockBrand('${brandId}')"
    class="btn btn-sm btn-outline-success"
  >
    <i class="fas fa-undo me-1"></i>Restore
  </button>`;
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: result.message || "Brand blocked successfully!",
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

async function unblockBrand(brandid) {
  const route = `/admin/unblockBrand?id=${brandid}`;
  try {
    // Send a fetch request to the server
    const response = await fetch(route, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    if (response.ok && result.success) {
        const element = document.getElementById(
            `badge-${result.updatedBrand.brandName}`
          );
          element.textContent = "active";
          element.className = "badge bg-success";
          const icon = document.getElementById(
            `icon-${result.updatedBrand.brandName}`
          );
          const brandId = icon.getAttribute(`data-id-${result.updatedBrand.brandName}`);

      icon.outerHTML = `  <button
                        id="icon"
                         onclick="blockBrand('${brandId}')"
                        class="btn btn-sm btn-outline-danger"
                      >
                        <i class="fas fa-ban me-1"></i>Block
                      </button>`;
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: result.message || "Brand unblocked successfully!",
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

document.getElementById("openModalBtn").addEventListener("click", function () {
  const dataId = this.getAttribute("data-id"); // Get data-id from button
  document.getElementById("modalData").textContent = dataId; // Insert into modal
  document.getElementById("myModal").style.display = "block"; // Show modal
});