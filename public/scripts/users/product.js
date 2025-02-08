function selectCombo(button) {
  // Retrieve data from the button's dataset
  const productId = button.dataset.productId;
  const ram = button.dataset.ram;
  const storage = button.dataset.storage;
  const color = button.dataset.color;
  const combos = button.dataset.combosId;
  const quantity = button.dataset.quantity;

  // Perform your fetch request using the dataset values
  fetch(
    `/productDetails/combo/${productId}?ram=${ram}&storage=${storage}&color=${color}&comboId=${combos}`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        console.log(data.combo.discountPrice);
        if (data.combo.discountPrice) {
          document.getElementById(
            "currentPrice"
          ).innerHTML = `<span> ₹${data.combo.discountPrice.toLocaleString()} </span> `;
          document.getElementById(
            "regularPrice"
          ).innerHTML = `<del>₹${data.combo.salePrice.toLocaleString()}</del>`;
        } else {
          document.getElementById(
            "currentPrice"
          ).innerHTML = `<span> ₹${data.combo.salePrice.toLocaleString()} </span> `;
          document.getElementById(
            "regularPrice"
          ).innerHTML = `<del>₹${data.combo.regularPrice.toLocaleString()}</del>`;
        }
        // Update the price information

        // Update the quantity status and action buttons
        const quantityStatus = document.getElementById("quantityStatus");
        const actionButtons = document.getElementById("actionButtons");
        console.log(data.combo.quantity);
        if (data.combo.quantity > 0) {
          quantityStatus.innerHTML = `${data.combo.quantity} Items in Stock`;
          actionButtons.innerHTML = `
            <input type="number" class="quantity" value="1" />
            <button class="btn btn-success" id="addToCart" onclick="addToCart('${productId}','${data.combo.combosId}')"> Add to cart</button>
          `;
        } else {
          quantityStatus.innerHTML = `<span class="text-danger">Out of Stock</span>`;
          actionButtons.innerHTML = `<button class="btn btn-danger" disabled>Out of Stock</button>`;
        }

        // Toggle the selected state for the combo buttons
        document.querySelectorAll(".combo-option").forEach((button) => {
          const isSelected =
            button.dataset.ram === ram &&
            button.dataset.storage === storage &&
            button.dataset.color === color;

          // Apply the appropriate classes based on selection
          if (isSelected) {
            button.classList.add("btn-primary", "size__link", "size-active");
            button.classList.remove("btn-outline-primary");
          } else {
            button.classList.remove("btn-primary", "size__link", "size-active");
            button.classList.add("btn-outline-primary");
          }
        });
      } else {
        alert("Combo not available.");
      }
    })
    .catch((error) => {
      console.error("Error fetching combo data:", error);
    });
}

async function addToCart(productId, comboId) {
  const quantityInput = document.querySelector(".quantity");
  const quantity = quantityInput ? parseInt(quantityInput.value, 10) : 1;
  const route = `/addCart/${productId}/combo/${comboId}`;

  try {
    const response = await fetch(route, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quantity }),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      // Success toast
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: result.message || "Added to cart successfully!",
        showConfirmButton: false,
        timer: 3000,
      });
    } else {
      // Error toast for server-side issues
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: result.message || "Failed to add to cart!",
        showConfirmButton: false,
        timer: 3000,
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

// Image Zoom functionality
function initializeImageZoom() {
  const container = document.querySelector(".img-zoom-container");
  const img = document.querySelector(".details__img");

  if (!container || !img) return;

  container.addEventListener("mousemove", (e) => {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate the position as a percentage
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    // Move the image in the opposite direction of the mouse
    img.style.transformOrigin = `${xPercent}% ${yPercent}%`;
  });
}

// Initialize zoom when the page loads
document.addEventListener("DOMContentLoaded", function () {
  initializeImageZoom();
});
