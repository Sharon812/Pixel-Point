function toggleAddressModal() {
  const modal = document.getElementById("addressModal");
  modal.classList.toggle("hidden");
}

function selectAddress(addressId) {
  // Perform an action to select the address (e.g., update it via an API call)
  console.log(`Selected Address ID: ${addressId}`);
}

document.addEventListener("DOMContentLoaded", () => {
  const placeOrderButton = document.querySelector(".place-order-btn");
  const checkoutForm = document.querySelector("#checkout-form");

  placeOrderButton.addEventListener("click", async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior

    try {
      // Get selected address and payment method
      const selectedAddress = document.querySelector(
        'input[name="selectedAddress"]:checked'
      )?.value;

      const paymentMethod = document.querySelector(
        'input[name="payment"]:checked'
      )?.id;

      // Validate input
      if (!selectedAddress || !paymentMethod) {
        return alert("Please select a delivery address and a payment method.");
      }

      // Prepare request payload
      const payload = {
        selectedAddress,
        paymentMethod,
      };

      // Make a POST request to the server
      const response = await fetch("/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Handle the server response
      const result = await response.json();

      if (response.ok || result.success) {
        // Redirect to order success page
        window.location.href = "/orderplaced";
      } else {
        // Show error message
        alert(result.message || "Failed to place the order. Please try again.");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert(
        "An error occurred while placing the order. Please try again later."
      );
    }
  });
});
