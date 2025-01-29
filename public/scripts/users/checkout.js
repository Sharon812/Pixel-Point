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
    event.preventDefault();

    try {
      const selectedAddress = document.querySelector(
        'input[name="selectedAddress"]:checked'
      )?.value;

      const paymentMethod = document.querySelector(
        'input[name="payment"]:checked'
      )?.id;

      if (!selectedAddress || !paymentMethod) {
        return alert("Please select a delivery address and payment method.");
      }

      const payload = { selectedAddress, paymentMethod };
      const response = await fetch("/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log(result);
      console.log(result.Final);
      if (!response.ok) {
        throw new Error(result.message || "Order placement failed");
      }

      // Handle Razorpay payment flow
      if (paymentMethod === "razorpay" && result.razorpayOrder) {
        const razorpayOptions = {
          key: "rzp_test_VwIcEmBewhtiOH", // Replace with actual key
          amount: result.razorpayOrder.amount,
          currency: "INR",
          name: "Pixel-Point",
          order_id: result.razorpayOrder.id,
          handler: async (razorpayResponse) => {
            try {
              // Verify payment with backend
              const verificationResponse = await fetch("/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                  razorpay_order_id: razorpayResponse.razorpay_order_id,
                  razorpay_signature: razorpayResponse.razorpay_signature,
                  orderId: result.order._id,
                }),
              });
              const verificationResult = await verificationResponse.json();

              if (!verificationResponse.ok) {
                throw new Error(
                  verificationResult.message || "Payment verification failed"
                );
              }

              // Redirect on successful verification
              window.location.href = "/orderplaced";
            } catch (error) {
              Swal.fire({
                toast: true,
                position: "top-end",
                icon: "error",
                text: error.message || "Payment verification failed",
                showConfirmButton: false,
                timer: 1200,
                timerProgressBar: true,
              }).then(() => {
                window.location.href = "/cart";
              });
            }
          },
          modal: {
            ondismiss: () => {
              Swal.fire({
                toast: true,
                position: "top-end",
                icon: "warning",
                text: "Payment cancelled",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
              });
            },
          },
          prefill: {
            name: "Customer Name", // Add dynamic data if available
            email: "customer@example.com",
            contact: "9123456789",
          },
          theme: {
            color: "#F37254",
          },
        };
        console.log(razorpayOptions);

        const rzp = new Razorpay(razorpayOptions);
        rzp.open();
      } else {
        // Handle COD or other payment methods
        window.location.href = "/orderplaced";
      }
    } catch (error) {
      console.error("Order Error:", error);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        text: error.message || "Order processing failed",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: "colored-toast error-toast",
          icon: "error-icon",
        },
      });
    }
  });
});
