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
            location.reload(); // Reload the page after successful deletion
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
    // Remove 'size-active' from all buttons
    document.querySelectorAll(".combo-option").forEach((btn) => {
      btn.classList.remove("size-active");
    });

    // Add 'size-active' to the clicked button
    this.classList.add("size-active");
  });
});
