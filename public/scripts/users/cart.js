async function deleteCartItem(cartId, itemId) {
  try {
    const confirmation = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to remove this item from your cart?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, remove it!",
    });

    if (confirmation.isConfirmed) {
      const response = await fetch(`/cart/${cartId}/item/${itemId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();

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

async function updateQuantity(comboId) {
  try {
    const response = await fetch(`/updateCart?comboId=${comboId}`, {
      method: "PATCH",
    });

    if (!response.ok) {
      Swal.fire({
        toast: true,
        icon: "error",
        title: response.message || `error occured`,
        position: "top-right",
        timer: 3000,
        showConfirmButton: false,
      });
    }

    const result = await response.json();
    console.log(result);
    if (result.success) {
      location.reload();
    } else {
      Swal.fire({
        toast: true,
        icon: "error",
        title: result.message || `error occured`,
        position: "top-right",
        timer: 3000,
        showConfirmButton: false,
      });
    }
  } catch (error) {
    Swal.fire({
      toast: true,
      icon: "error",
      title: error.message,
      position: "top-right",
      timer: 3000,
      showConfirmButton: false,
    });
  }
}

async function decreaseQuantity(comboId) {
  try {
    const response = await fetch(`/decreaseQuantity?comboId=${comboId}`, {
      method: "PATCH",
    });

    if (!response.ok) {
      Swal.fire({
        toast: true,
        icon: "error",
        title: response.message || `error occured`,
        position: "top-right",
        timer: 3000,
        showConfirmButton: false,
      });
    }

    const result = await response.json();

    if (result.success) {
      location.reload();
    } else {
      throw new Error(result.message || "An error occurred.");
    }
  } catch (error) {
    Swal.fire({
      toast: true,
      icon: "error",
      title: error.message,
      position: "top-right",
      timer: 3000,
      showConfirmButton: false,
    });
  }
}
