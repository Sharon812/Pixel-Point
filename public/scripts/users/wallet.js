function validateAmount() {
  const amount = document.getElementById("amount").value;
  const errorMessage = document.getElementById("errorMessage");
  if (amount && amount > 0) {
    errorMessage.style.display = "none";
  } else {
    errorMessage.style.display = "block";
  }
}

async function validateAndSubmit(event) {
  event.preventDefault();

  const amount = document.getElementById("amount").value;
  const errorMessage = document.getElementById("errorMessage");

  if (!amount || isNaN(amount) || amount <= 0) {
    errorMessage.textContent = "Please enter a valid amount.";
    return;
  }

  if (amount > 10000) {
    errorMessage.textContent = "Max limit 1,00,000/-";
    errorMessage.style.display = "block";
    return;
  }

  const walletBalance = walletData.walletBalance;

  if (walletBalance + parseInt(amount) > 200000) {
    errorMessage.textContent = "Total wallet balance cannot exceed 1 lakh.";
    errorMessage.style.display = "block";
    return;
  }

  errorMessage.style.display = "none";

  try {
    const response = await fetch("/add-money", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: parseInt(amount) }),
    });

    const result = await response.json();
    console.log("result", result);

    if (result.success) {
      // Fetch user details (name and email) dynamically
      //   const userDetailsResponse = await fetch("/verify-addmoney-payment", {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify({
      //       razorpay_payment_id: razorpayResponse.razorpay_payment_id,
      //       razorpay_order_id: razorpayResponse.razorpay_order_id,
      //       razorpay_signature: razorpayResponse.razorpay_signature,
      //     }),
      //   });

      //   const userDetails = await userDetailsResponse.json();
      //   console.log("userdetails", userDetails);
      //   if (!userDetails.success) {
      //     alert("Failed to fetch user details.");
      //     return;
      //   }

      //   const { name, email } = userDetails;

      // Razorpay order created successfully, open the Razorpay popup
      const options = {
        key: "rzp_test_VwIcEmBewhtiOH", // Replace with your Razorpay API key
        amount: result.order.amount, // Amount in paise
        currency: "INR",
        name: "Pixel-Point",
        description: "Add Money to Wallet",
        order_id: result.order.id, // Razorpay Order ID
        handler: async function (response) {
          // On successful payment, send verification data to the backend
          const verificationResponse = await fetch("/verify-addmoney-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              amount: parseInt(amount),
            }),
          });

          const verificationResult = await verificationResponse.json();
          if (verificationResult.success) {
            window.location.href = "/wallet";
          } else {
            alert("Payment verification failed.");
          }
        },
        prefill: {
          name: "Guest", // User's name
          email: "guest@example.com", // User's email
        },
        theme: {
          color: "#3399cc",
        },
      };
      console.log("options", options);
      const razorpay = new Razorpay(options);
      razorpay.open();
    } else {
      alert("Failed to create Razorpay order. Please try again.");
    }
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    alert("An error occurred. Please try again.");
  }
}
// Add Money Modal functionality
const modal = document.getElementById("addMoneyModal");
const addMoneyBtn = document.getElementById("addMoneyBtn");
const closeBtn = document.querySelector(".close-modal");
const amountInput = document.getElementById("amount");
const quickAmountBtns = document.querySelectorAll(".quick-amount");
const proceedBtn = document.querySelector(".proceed-btn");

// Open modal
addMoneyBtn.addEventListener("click", () => {
  modal.style.display = "flex";
});

// Close modal
closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

// Close modal when clicking outside
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

// Quick amount buttons
quickAmountBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const amount = btn.dataset.amount;
    amountInput.value = amount;
  });
});

// Existing filter functionality
const filterButtons = document.querySelectorAll(".type-btn");
const transactions = document.querySelectorAll(".transaction-item");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    const filterType = button.dataset.type;

    transactions.forEach((transaction) => {
      if (filterType === "all" || transaction.dataset.type === filterType) {
        transaction.style.display = "flex";
      } else {
        transaction.style.display = "none";
      }
    });
  });
});
