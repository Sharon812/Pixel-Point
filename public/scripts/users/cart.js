async function deleteCartItem(cartId, itemId) {
  try {
    // Step 1: Ask for confirmation
    console.log(cartId, itemId);
    const confirmation = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to remove this item from your cart?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, remove it!",
    });

    // Step 2: If confirmed, send a fetch request
    if (confirmation.isConfirmed) {
      const response = await fetch(`/cart/${cartId}/item/${itemId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Step 3: Handle the response
      if (response.ok) {
        const result = await response.json();

        // Show a success toast
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: result.message || "Item removed successfully!",
          showConfirmButton: false,
          timer: 3000,
        }).then(() => {
          window.location.reload();
        });
      } else {
        const errorResult = await response.json();

        // Show an error toast
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "error",
          title: errorResult.message || "Failed to remove item",
          showConfirmButton: false,
          timer: 3000,
        });
      }
    }
  } catch (error) {
    console.error("Error deleting cart item:", error);

    // Show an error toast for unexpected errors
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "error",
      title: "An error occurred. Please try again.",
      showConfirmButton: false,
      timer: 3000,
    });
  }
}
