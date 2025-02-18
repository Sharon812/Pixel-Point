let orderId = null;
let itemId = null;

function openCancelModal(itemid, orderid) {
  const modal = document.getElementById("cancelModal");
  modal.classList.add("show");
  orderId = orderid;
  itemId = itemid;
}

function closeCancelModal() {
  const modal = document.getElementById("cancelModal");
  modal.classList.remove("show");
  document.getElementById("cancelReason").value = "";
}

async function confirmCancelOrder() {
  const reason = document.getElementById("cancelReason").value;
  console.log(reason);
  if (!reason.trim()) {
    Swal.fire({
      icon: "warning",
      title: "Missing Reason",
      text: "Please provide a reason for cancellation.",
    });
    return;
  }

  try {
    const response = await fetch("/cancelOrder", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ itemId, orderId, reason }),
    });

    const data = await response.json();

    if (data.success) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Item Cancelled Successfully!",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        customClass: {
          popup: "colored-toast",
          icon: "success-icon",
        },
      }).then(() => {
        location.reload();
      });
    } else {
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
    console.error("Error:", error);
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
  } finally {
    closeCancelModal();
  }
}

document.querySelector(".cancel-modal").addEventListener("click", function (e) {
  if (e.target === this) {
    closeCancelModal();
  }
});

function openReturnModal(itemid, orderid) {
  const modal = document.getElementById("returnModal");
  modal.classList.add("show");
  orderId = orderid;
  itemId = itemid;
}
function closeReturnModal() {
  const modal = document.getElementById("returnModal");
  modal.classList.remove("show");
  document.getElementById("cancelReason").value = "";
}

async function confirmReturnOrder() {
  const reason = document.getElementById("returnReason").value;
  console.log(reason);
  if (!reason.trim()) {
    Swal.fire({
      icon: "warning",
      title: "Missing Reason",
      text: "Please provide a reason for cancellation.",
    });
    return;
  }

  try {
    const response = await fetch("/returnorder", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ itemId, orderId, reason }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "return requested Successfully!",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        customClass: {
          popup: "colored-toast",
          icon: "success-icon",
        },
      }).then(() => {
        location.reload();
      });
    } else {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Error!",
        text: data.message || "An error occurred. Please try again.",
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
    console.error("Error:", error);
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "error",
      title: "Error!",
      text: error.message || "An error occurred. Please try again.",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      customClass: {
        popup: "colored-toast error-toast",
        icon: "error-icon",
      },
    });
  } finally {
    closeReturnModal();
  }
}

//for retrypayment
async function retryPayment(orderId) {
  try {
    if (!orderId) {
      return Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Error!",
        text: "OrderId not found",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: "colored-toast error-toast",
          icon: "error-icon",
        },
      });
    }

    const response = await fetch("/retry-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId }),
    });
    console.log(response, "responses");
    const result = await response.json();
    console.log(result, "result");
    if (!response.ok) {
      return Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Error!",
        text: result.message || "Error occured ",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: "colored-toast error-toast",
          icon: "error-icon",
        },
      });
    }

    const razorpayOptions = {
      key: "rzp_test_VwIcEmBewhtiOH",
      amount: result.razorpayOrder.amount,
      currency: result.razorpayOrder.currency,
      name: "Pixel Point",
      description: "Purchase from Pixel Point",
      order_id: result.razorpayOrder.id,
      handler: function (razorpayResponse) {
        if (!razorpayResponse.razorpay_payment_id) {
          console.log("Payment failed in Razorpay UI.");
          window.location.href = `/orderPending?orderId=${result.order._id}`;
          return;
        }
        fetch("/verify-retry-payment", {
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
            // verificationRes = verificationResult
            if (verificationResult.success) {
              window.location.href = `/orderplaced/?orderId=${verificationResult.order}`;
            } else {
              window.location.href = `/orderPending?orderId=${result.order._id}`;
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
          console.log("Payment dismissed by user.");
          window.location.href = `/orderPending?orderId=${result.order._id}`;
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
  } catch (error) {
    console.log(error, "error at retrypayment function");
  }
}

async function downloadInvoice(itemId, orderId) {
  try {
    const response = await fetch(`/invoice/${itemId}/${orderId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to download invoice");
    }

    // Get the blob from the response
    const blob = await response.blob();

    // Create a temporary URL for the blob
    const url = window.URL.createObjectURL(blob);

    // Create a temporary link element
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${itemId}.pdf`;

    // Append to body, click and remove
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Clean up the temporary URL
    window.URL.revokeObjectURL(url);

    // Show success message
    Swal.fire({
      icon: "success",
      title: "Success",
      text: "Invoice downloaded successfully!",
      timer: 2000,
      showConfirmButton: false,
    });
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message || "Failed to download invoice",
    });
  }
}
