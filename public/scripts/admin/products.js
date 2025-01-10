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
