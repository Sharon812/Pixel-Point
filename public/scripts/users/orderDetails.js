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
  const modal = document.getElementById("cancelModal");
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
