 document.addEventListener("DOMContentLoaded", function () {
  // Sidebar toggle functionality
  const sidebarToggle = document.getElementById("sidebarToggle");
  const sidebarClose = document.getElementById("sidebarClose");
  const sidebar = document.getElementById("sidebar");

  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", function () {
      sidebar.classList.toggle("show");
    });
  }

  if (sidebarClose) {
    sidebarClose.addEventListener("click", function () {
      sidebar.classList.remove("show");
    });
  }

 const startDateInput = document.getElementById("startDate");
  const expiryDateInput = document.getElementById("expiryDate");

  const today = new Date().toISOString().split('T')[0];
  if (startDateInput) {
    startDateInput.min = today;
    startDateInput.addEventListener('change', function() {
      if (expiryDateInput) {
        expiryDateInput.min = this.value;
        
        if (expiryDateInput.value && expiryDateInput.value < this.value) {
          expiryDateInput.value = '';
        }
      }
    });
  }

  if (expiryDateInput) {
    expiryDateInput.min = today;
  }

  const addCouponForm = document.getElementById("addCouponForm");
  if (addCouponForm) {
    addCouponForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      // Get form data
      const formData = new FormData(this);
      const startDate = formData.get("startDate");
      const expiryDate = formData.get("expiryDate");
      // Additional date validation
      if (startDate < today) {
        Swal.fire({
          title: "Error!",
          text: "Start date cannot be before today",
          icon: "error",
          confirmButtonColor: "#4e73df",
        });
        return;
      }

      if (expiryDate < startDate) {
        Swal.fire({
          title: "Error!",
          text: "Expiry date must be after start date",
          icon: "error",
          confirmButtonColor: "#4e73df",
        });
        return;
      }

      const couponData = {
        name: formData.get("code"),
        offerPrice: Number(formData.get("offerAmount")),
        minimumPrice: Number(formData.get("minPurchase")),
        expireOn: expiryDate,
        startOn: startDate,
        maxUses: Number(formData.get("usesLeft")),
        maxUsesPerUser: Number(formData.get("maxUsesPerUser")),
      };

      try {
        const response = await fetch("/admin/addcoupons", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(couponData),
        });

        if (!response.ok) {
          throw new Error("Failed to add coupon");
        }

        const result = await response.json();

        // Show success message
        Swal.fire({
          title: "Success!",
          text: "Coupon added successfully",
          icon: "success",
          confirmButtonColor: "#4e73df",
        }).then(() => {
          // Close modal and refresh page
          const modal = bootstrap.Modal.getInstance(
            document.getElementById("addCouponModal")
          );
          modal.hide();
          window.location.reload();
        });
      } catch (error) {
        console.error("Error:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to add coupon. Please try again.",
          icon: "error",
          confirmButtonColor: "#4e73df",
        });
      }
    });
  }

  // Validate maxUsesPerUser input
  const maxUsesPerUserInput = document.getElementById("maxUsesPerUser");
  if (maxUsesPerUserInput) {
    maxUsesPerUserInput.addEventListener("input", function () {
      const value = parseInt(this.value);
      if (value > 10) {
        this.value = 10;
      } else if (value < 1) {
        this.value = 1;
      }
    });
  }

  // Delete coupon functionality
  const deleteButtons = document.querySelectorAll(".delete-coupon");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const couponId = this.dataset.id;

      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#4e73df",
        cancelButtonColor: "#e74a3b",
        confirmButtonText: "Yes, delete it!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const response = await fetch(`/admin/delete-coupon/${couponId}`, {
              method: "PATCH",
            });

            if (!response.ok) {
              throw new Error("Failed to delete coupon");
            }

            Swal.fire("Deleted!", "Coupon has been deleted.", "success").then(
              () => {
                window.location.reload();
              }
            );
          } catch (error) {
            console.error("Error:", error);
            Swal.fire("Error!", "Failed to delete coupon.", "error");
          }
        }
      });
    });
  });

  // Toggle status functionality
  const toggleButtons = document.querySelectorAll(".toggle-status");
  toggleButtons.forEach((button) => {
    button.addEventListener("click", async function () {
      const couponId = this.dataset.id;

      try {
        const response = await fetch(
          `/admin/update-coupon-status/${couponId}`,
          {
            method: "PATCH",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to toggle coupon status");
        }

        const result = await response.json();

        // Show success message and reload
        Swal.fire({
          title: "Success!",
          text: `Coupon status ${
            result.status === "ACTIVE" ? "activated" : "deactivated"
          } successfully`,
          icon: "success",
          confirmButtonColor: "#4e73df",
        }).then(() => {
          window.location.reload();
        });
      } catch (error) {
        console.error("Error:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to toggle coupon status.",
          icon: "error",
          confirmButtonColor: "#4e73df",
        });
      }
    });
  });

  // Set minimum date for expiry date input
  // const expiryDateInput = document.getElementById("expiryDate");
  if (expiryDateInput) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split("T")[0];
    expiryDateInput.setAttribute("min", minDate);
  }
});
