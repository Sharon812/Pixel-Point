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
    console.log(result);
    if (response.ok && result.success) {
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

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".wishlist__btn").forEach((icon) => {
    icon.addEventListener("click", async function () {
      const route = `/addToWishlist`;
      const productId = this.dataset.id;
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
            title: result.message || "Item added to Wishlist !",
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            customClass: {
              popup: "colored-toast",
              icon: "success-icon",
            },
          }).then(() => {
            this.classList.toggle("active");
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
    });
  });
});
