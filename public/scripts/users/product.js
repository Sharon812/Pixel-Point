function selectCombo(button) {
  // Retrieve data from the button's dataset
  const productId = button.dataset.productId;
  const ram = button.dataset.ram;
  const storage = button.dataset.storage;
  const color = button.dataset.color;
  const combos = button.dataset.combosId;

  // Perform your fetch request using the dataset values
  fetch(
    `/productDetails/combo/${productId}?ram=${ram}&storage=${storage}&color=${color}&comboId=${combos}`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        document.getElementById(
          "currentPrice"
        ).innerHTML = `<span> ₹${data.combo.salePrice.toLocaleString()} </span> `;

        document.getElementById(
          "regularPrice"
        ).innerHTML = `<del>₹${data.combo.regularPrice.toLocaleString()}</del>`;

        const quantityStatus = document.getElementById("quantityStatus");
        const actionButtons = document.getElementById("actionButtons");

        if (data.combo.quantity > 0) {
          quantityStatus.innerHTML = `${data.combo.quantity} Items in Stock`;
          console.log("comboid", data.combo.combosId);
          actionButtons.innerHTML = `
              <button class="btn btn-success" id="addToCart" onclick="addToCart('${productId}','${data.combo.combosId}')"> Add to cart</button>
            
            
            `;
        } else {
          quantityStatus.innerHTML = `<span class="text-danger">Out of Stock</span>`;
          actionButtons.innerHTML = `<button class="btn btn-danger" disabled>Out of Stock</button>`;
        }

        document.querySelectorAll(".combo-option").forEach((button) => {
          const isSelected =
            button.dataset.ram === ram &&
            button.dataset.storage === storage &&
            button.dataset.color === color;

          button.classList.toggle("btn-primary", isSelected);
          button.classList.toggle("btn-outline-primary", !isSelected);
        });
      } else {
        alert("Combo not available.");
      }
    })
    .catch((error) => {
      console.error("Error fetching combo data:", error);
    });
}

// Add to Cart Function with Fetch and SweetAlert Toasts
async function addToCart(productId, comboId) {
  console.log(productId);
  const quantityInput = document.querySelector(".quantity");
  const quantity = quantityInput ? parseInt(quantityInput.value, 10) : 1; // Default to 1 if input is not found or invalid
  // Construct the route dynamically using template literals
  const route = `/addCart/${productId}/combo/${comboId}`;

  try {
    // Send a fetch request to the server
    const response = await fetch(route, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quantity }), // Include the user-selected quantity in the body
    });

    // Parse the response JSON
    const result = await response.json();

    if (response.ok) {
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

// Example usage
// Assuming product and combo IDs are dynamically provided in your EJS template
// const productId = '<%= product._id %>';
// const comboId = '<%= product.combos[0]._id %>';

// Add event listener to the Add to Cart button
