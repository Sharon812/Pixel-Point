function toggleAddressModal() {
  const modal = document.getElementById("addressModal");
  modal.classList.toggle("hidden");
}

// function selectAddress(addressId) {
//   // Perform an action to select the address (e.g., update it via an API call)
//   console.log(`Selected Address ID: ${addressId}`);
// }

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

      // Get discounted total from session storage if available
      let discountedTotal = null;
      const checkoutData = sessionStorage.getItem("checkoutTotal");
      if (checkoutData) {
        const parsedData = JSON.parse(checkoutData);
        discountedTotal = parsedData.discountedTotal;
      }

      const payload = {
        selectedAddress,
        paymentMethod,
        discountedTotal, // Include discounted total in the payload
      };

      const response = await fetch("/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log(result);
      console.log(result.finalAmount, "Final Amount");
      if (!response.ok) {
        throw new Error(result.message || "Order placement failed");
      }

      // Handle Razorpay payment flow
      if (paymentMethod === "razorpay" && result.razorpayOrder) {
        const razorpayOptions = {
          key: "rzp_test_VwIcEmBewhtiOH", // Replace with actual key
          amount: result.razorpayOrder.amount,
          currency: result.razorpayOrder.currency,
          name: "Pixel Point",
          description: "Purchase from Pixel Point",
          order_id: result.razorpayOrder.id,
          handler: function (razorpayResponse) {
            // After successful payment
            fetch("/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_signature: razorpayResponse.razorpay_signature,
                order_id: result.order._id,
              }),
            })
              .then((res) => res.json())
              .then((verificationResult) => {
                if (verificationResult.success) {
                  // Clear session storage after successful payment
                  sessionStorage.removeItem("checkoutTotal");
                  sessionStorage.removeItem("appliedCoupon");
                  window.location.href = "/orderplaced";
                } else {
                  alert("Payment verification failed. Please contact support.");
                }
              })
              .catch((error) => {
                console.error("Payment verification error:", error);
                alert(
                  "Error verifying payment. Please check your order status or contact support."
                );
              });
          },
          modal: {
            ondismiss: function () {
              alert(
                "Payment cancelled. Your order is saved but pending payment. Please complete payment to process your order."
              );
            },
          },
          prefill: {
            name: "Customer Name", // Add dynamic data if available
            email: "customer@example.com",
            contact: "9123456789",
          },
          notes: {
            order_id: result.order._id,
          },
        };

        const razorpayInstance = new Razorpay(razorpayOptions);
        razorpayInstance.open();
      } else if (result.success) {
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
