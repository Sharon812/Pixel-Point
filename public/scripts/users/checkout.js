function toggleAddressModal() {
  const modal = document.getElementById("addressModal");
  modal.classList.toggle("hidden");
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

      let discountedTotal = null;
      let couponCode = null;
      let discount = null;
      const checkoutData = sessionStorage.getItem("checkoutTotal");
      const appliedcouon = sessionStorage.getItem("appliedCoupon");
      const couponParsedData = JSON.parse(appliedcouon);
      couponCode = couponParsedData ? couponParsedData.code : null;
      if (checkoutData) {
        const parsedData = JSON.parse(checkoutData);
        discountedTotal = parsedData.discountedTotal;
        discount = parsedData ? parsedData.discount : null;
      }

      const payload = {
        selectedAddress,
        paymentMethod,
        couponCode,
        discountedTotal,
        discount,
      };
      const response = await fetch("/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Order placement failed");
      }

      if (paymentMethod === "razorpay" && result.razorpayOrder) {
        const razorpayOptions = {
          key: "rzp_test_VwIcEmBewhtiOH",
          amount: result.razorpayOrder.amount,
          currency: result.razorpayOrder.currency,
          name: "Pixel Point",
          description: "Purchase from Pixel Point",
          order_id: result.razorpayOrder.id,
          handler: function (razorpayResponse) {
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
                console.log(verificationResult,"res")
                if (verificationResult.success) {
                  sessionStorage.removeItem("checkoutTotal");
                  sessionStorage.removeItem("appliedCoupon");
                  window.location.href = `/orderplaced/?orderId=${verificationResult.order}`;
                } else {
                  sessionStorage.removeItem("checkoutTotal");
                  sessionStorage.removeItem("appliedCoupon");
                  Swal.fire({
                    toast: true,
                    position: "top-end",
                    icon: "error",
                    text: error.message || "Payment verification failed please call support",
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    customClass: {
                      popup: "colored-toast error-toast",
                      icon: "error-icon",
                    },
                  });                }
              })
              .catch((error) => {
                sessionStorage.removeItem("checkoutTotal");
                sessionStorage.removeItem("appliedCoupon");
                console.error("Payment verification error:", error);
                alert(
                  "Error verifying payment. Please check your order status or contact support."
                );
              });
          },
          modal: {
            ondismiss: function () {
              sessionStorage.removeItem("checkoutTotal");
              sessionStorage.removeItem("appliedCoupon");
              alert(
                "Payment cancelled. Your order is saved but pending payment. Please complete payment to process your order."
              );
            },
          },
          prefill: {
            name: "Customer Name",
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
        sessionStorage.removeItem("checkoutTotal");
        sessionStorage.removeItem("appliedCoupon");
        window.location.href = `/orderplaced/?orderId=${result.order.orderId}`;
      }
    } catch (error) {
      sessionStorage.removeItem("checkoutTotal");
      sessionStorage.removeItem("appliedCoupon");
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

async function deleteAddress(addressId) {
  try {
    // Ask for confirmation using SweetAlert
    const confirmation = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone. Do you want to delete this address?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (confirmation.isConfirmed) {
      // Send a DELETE request to the server
      const response = await fetch(`/deleteAddreess/${addressId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Show success toast
        Swal.fire({
          toast: true,
          icon: "success",
          title: "Address deleted successfully!",
          position: "top-end",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          window.location.reload();
        });
      } else {
        // Show error toast
        Swal.fire({
          toast: true,
          icon: "error",
          title: result.message || "Failed to delete address!",
          position: "top-end",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    }
  } catch (error) {
    // Show error toast for unexpected issues
    Swal.fire({
      toast: true,
      icon: "error",
      title: "An unexpected error occurred!",
      position: "top-end",
      timer: 1500,
      showConfirmButton: false,
    });
  }
}

//for address
// Address Modal Functions
function openAddressModal() {
  document.getElementById("addressModal").style.display = "block";
}

function closeAddressModal() {
  document.getElementById("addressModal").style.display = "none";
}

function selectAddress(addressId) {
  // Remove selected class from all options
  document.querySelectorAll(".address-option").forEach((option) => {
    option.classList.remove("selected");
  });

  // Add selected class to clicked option
  const selectedOption = document.querySelector(
    `.address-option[data-address-id="${addressId}"]`
  );
  if (selectedOption) {
    selectedOption.classList.add("selected");
    selectedOption.querySelector('input[type="radio"]').checked = true;
  }
}

function confirmAddressSelection() {
  const selectedAddressId = document.querySelector(
    'input[name="modalAddress"]:checked'
  ).value;
  const selectedAddress = document.querySelector(
    `.address-option[data-address-id="${selectedAddressId}"]`
  );

  if (selectedAddress) {
    const primaryAddress = document.querySelector(".primary-address");
    primaryAddress.querySelector('input[type="radio"]').value =
      selectedAddressId;
    primaryAddress.querySelector(".address__details").textContent =
      selectedAddress.querySelector(".address__details").textContent;
    primaryAddress.querySelector(".contact__number").textContent =
      selectedAddress.querySelector(".contact__number").textContent;
    primaryAddress.querySelector(".address__type").textContent =
      selectedAddress.querySelector(".address__type").textContent;
  }

  closeAddressModal();
}

window.onclick = function (event) {
  const modal = document.getElementById("addressModal");
  if (event.target === modal) {
    closeAddressModal();
  }
};

// Add click event listeners to address options
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".address-option").forEach((option) => {
    option.addEventListener("click", function () {
      const addressId = this.dataset.addressId;
      selectAddress(addressId);
    });
  });
});


//for add address
    // Add this to your existing JavaScript
    document.addEventListener('DOMContentLoaded', function() {
      const addAddressBtn = document.getElementById('addAddressBtn');
      const newAddressModal = new bootstrap.Modal(document.getElementById('newAddressModal'), {
        backdrop: true,
        keyboard: true
      });
      
      // Show modal when add address button is clicked
      addAddressBtn.addEventListener('click', function(e) {
        e.preventDefault();
        newAddressModal.show();
      });

      // // Close modal when clicking outside
      // document.querySelector('.modal-backdrop').addEventListener('click', function() {
      //   newAddressModal.hide();
      // });

      // Form validation
      document
      .getElementById("newAddressForm")
      .addEventListener("submit", async function (e) {
        e.preventDefault(); 
    
        let isValid = true;
    
        document
          .querySelectorAll(".error-message")
          .forEach((el) => (el.textContent = ""));
    
    
        const houseName = document.getElementById("houseName");
        if (!houseName.value.trim()) {
          document.getElementById("houseNameError").textContent =
            "House name is required.";
          isValid = false;
        }
    
        // Address Type
        const addressType = document.getElementById("type");
        if (!addressType.value) {
          document.getElementById("addressTypeError").textContent =
            "Please select an address type.";
          isValid = false;
        }
    
        // City
        const city = document.getElementById("city");
        if (!city.value.trim()) {
          document.getElementById("cityError").textContent = "City is required.";
          isValid = false;
        }
    
        // State
        const state = document.getElementById("state");
        if (!state.value.trim()) {
          document.getElementById("stateError").textContent = "State is required.";
          isValid = false;
        }
    
        // Landmark
        const landmark = document.getElementById("landmark");
        if (!landmark.value.trim()) {
          document.getElementById("landMarkError").textContent =
            "Landmark is required.";
          isValid = false;
        }
    
        // Pincode
        const pincode = document.getElementById("pincode");
        if (!pincode.value.match(/^\d{6}$/)) {
          document.getElementById("pincodeError").textContent =
            "Pincode must be a 6-digit number.";
          isValid = false;
        }
    
        // Phone Number
        const phone = document.getElementById("phone");
        if (!phone.value.match(/^\d{10}$/)) {
          document.getElementById("phoneError").textContent =
            "Phone number must be a 10-digit number.";
          isValid = false;
        }
    
        // Alternate Phone
        const altPhone = document.getElementById("alt-phone");
        if (!altPhone.value.match(/^\d{10}$/)) {
          document.getElementById("altPhoneError").textContent =
            "Alternate phone number must be a 10-digit number.";
          isValid = false;
        }
    
        if (!isValid) {
          return; // Stop further execution
        }
    
        // If the form is valid, prepare data for submission
        const formData = {
          houseName: houseName.value.trim(),
          type: addressType.value,
          city: city.value.trim(),
          state: state.value.trim(),
          landmark: landmark.value.trim(),
          pincode: pincode.value,
          phone: phone.value,
          altPhone: altPhone.value,
        };
    
        try {
          // Send data using Fetch API
          const response = await fetch("/add-address", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          });
    
          // Handle server response
          if (response.ok) {
            const result = await response.json();
            Swal.fire({
              icon: "success",
              title: "Success",
              timer: 1500,
              showConfirmButton: false,
              text: result.message || "Address added successfully!",
            }).then(() => {
              window.location.reload()
            });
          } else {
            const error = await response.json();
            Swal.fire({
              icon: "error",
              title: "Error",
              text: error.message || "Failed to add the address.",
            });
          }
        } catch (error) {
          // Handle network or server errors
          Swal.fire({
            icon: "error",
            title: result.message || "Network Error",
            text: "An error occurred while submitting the form. Please try again.",
          });
        }
      });
    })    