function softDeleteProduct(productId) {
  Swal.fire({
    title: "Are you sure?",
    text: "You are about to delete this product!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`/admin/products/deleteProduct?id=${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to delete the category");
          }
          return response.json();
        })
        .then(() => {
          Swal.fire({
            icon: "success",
            title: "<strong>Category deleted successfully!</strong>",
            toast: true,
            position: "top-end",
            background: "#f0f9eb",
            color: "#3c763d",
            showConfirmButton: false,
            timer: 1200,
            timerProgressBar: true,
          }).then(() => {
            location.reload();
          });
        })
        .catch((error) => {
          Swal.fire({
            icon: "error",
            title: "<strong>Error occurred!</strong>",
            text: error.message,
            background: "#f9ebeb",
            color: "#a94442",
          });
        });
    }
  });
}

function selectCombo(button) {
  document.querySelectorAll(".combo-option").forEach((btn) => {
    btn.classList.remove("size-active");
  });

  button.classList.add("size-active");
}

document.querySelectorAll(".combo-option").forEach((button) => {
  button.addEventListener("click", function () {
    document.querySelectorAll(".combo-option").forEach((btn) => {
      btn.classList.remove("size-active");
    });

    this.classList.add("size-active");
  });
});

function openAddOfferModal(productId) {
  document.getElementById("productId").value = productId;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];
  document.getElementById("endDate").min = minDate;

  document.getElementById("addOfferForm").reset();

  const modal = new bootstrap.Modal(document.getElementById("addOfferModal"));
  modal.show();
}

function validateOfferForm() {
  const form = document.getElementById("addOfferForm");
  const percentage = document.getElementById("percentage");
  const endDate = document.getElementById("endDate");
  let isValid = true;

  const percentageValue = parseInt(percentage.value);
  if (isNaN(percentageValue) || percentageValue < 1 || percentageValue > 100) {
    percentage.classList.add("is-invalid");
    isValid = false;
  } else {
    percentage.classList.remove("is-invalid");
  }

  const selectedDate = new Date(endDate.value);
  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (!endDate.value || selectedDate < tomorrow) {
    endDate.classList.add("is-invalid");
    isValid = false;
  } else {
    endDate.classList.remove("is-invalid");
  }

  return isValid;
}

function submitOffer() {
  if (!validateOfferForm()) {
    return;
  }

  const form = document.getElementById("addOfferForm");
  const formData = {
    productId: document.getElementById("productId").value,
    percentage: document.getElementById("percentage").value,
    endDate: document.getElementById("endDate").value,
  };
  fetch("/admin/add-product-offer", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      productId: formData.productId,
      offerPercentage: formData.percentage,
      endDate: formData.endDate,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data, "data");
      if (data.success) {
        const modal = bootstrap.Modal.getInstance(
          document.getElementById(`addOfferModal`)
        );
        modal.hide();

        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Offer added successfully",
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          window.location.reload();
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: data.message || "Failed to add offer",
        });
      }
    })
    .catch((error) => {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to add offer. Please try again.",
      });
    });
}

document.addEventListener("DOMContentLoaded", function () {
  const percentage = document.getElementById("percentage");
  const endDate = document.getElementById("endDate");

  percentage.addEventListener("input", function () {
    const value = this.value;
    if (value && (value < 1 || value > 100)) {
      this.classList.add("is-invalid");
    } else {
      this.classList.remove("is-invalid");
    }
  });

  endDate.addEventListener("input", function () {
    const selectedDate = new Date(this.value);
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (selectedDate < tomorrow) {
      this.classList.add("is-invalid");
    } else {
      this.classList.remove("is-invalid");
    }
  });
});

const removeOffer = async (productId) => {
  Swal.fire({
    title: "Are you sure?",
    text: "Do you really want to remove this offer?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, remove it!",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch("/admin//remove-product-offer", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId }),
        });

        const data = await response.json();

        if (data.success) {
          Swal.fire("Removed!", "The offer has been removed.", "success").then(
            () => {
              location.reload();
            }
          );
        } else {
          Swal.fire("Error!", data.message || "Something went wrong.", "error");
        }
      } catch (error) {
        Swal.fire("Error!", "Failed to remove the offer.", "error");
      }
    }
  });
};
