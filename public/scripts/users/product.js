function selectCombo(button) {
  // Retrieve data from the button's dataset
  const productId = button.dataset.productId;
  const ram = button.dataset.ram;
  const storage = button.dataset.storage;
  const color = button.dataset.color;

  // Perform your fetch request using the dataset values
  fetch(
    `/productDetails/combo/${productId}?ram=${ram}&storage=${storage}&color=${color}`
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

          actionButtons.innerHTML = `
              <a id="addToCartBtn" href="/add-to-cart/${productId}?ram=${ram}&storage=${storage}&color=${color}&quantity=${
            document.getElementById("quantityInput").value
          }&price=${data.combo.salePrice}">
                <button class="btn btn-success">Add to Cart</button>
              </a>
              <a id="buyNowBtn" href="/buy-now/${productId}?ram=${ram}&storage=${storage}&color=${color}">
                <button class="btn btn-primary">Buy Now</button>
              </a>
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

        document.getElementById("quantityInput").max = data.combo.quantity;
      } else {
        alert("Combo not available.");
      }
    })
    .catch((error) => {
      console.error("Error fetching combo data:", error);
    });
}
