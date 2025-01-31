// document
//     .getElementById("addMoneyButton")
//     .addEventListener("click", function () {
//       const addMoneySection = document.getElementById("addMoneySection");
//       addMoneySection.innerHTML = `
//     <form id="addMoneyForm" method="POST" onsubmit="return validateAndSubmit(event)">
//       <input type="number" id="moneyAmount" name="amount" class="form-control mb-3 input-small" placeholder="Enter amount" />
//       <div id="errorMessage" class="error-message" style="display: none;">Please enter a valid amount.</div>
//       <button type="submit" class="btn btn-success">Continue</button>
//     </form>
//   `;
//       addMoneySection.classList.add("show");

//       document
//         .getElementById("moneyAmount")
//         .addEventListener("input", validateAmount);
//     });

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
  event.preventDefault(); // Prevent form from actually submitting

  const amount = document.getElementById("amount").value;
  const errorMessage = document.getElementById("errorMessage");

  // Validate the amount
  if (!amount || isNaN(amount) || amount <= 0) {
    errorMessage.textContent = "Please enter a valid amount.";
    return;
  }

  if (amount > 50000) {
    errorMessage.textContent = "Max limit 50,000/-";
    errorMessage.style.display = "block";
    return;
  }

  // // Fetch the current wallet balance
  // const walletBalance = <%= locals.wallet.balance %>;

  // // Check if the total balance exceeds 1 lakh
  // if (walletBalance + parseInt(amount) > 100000) {
  //   errorMessage.textContent = "Total wallet balance cannot exceed 1 lakh.";
  //   errorMessage.style.display = "block";
  //   return;
  // }

  errorMessage.style.display = "none";

  try {
    // Create Razorpay order by calling the `/add-money` route
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
