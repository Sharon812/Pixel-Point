document
  .getElementById("sidebarToggle")
  ?.addEventListener("click", function () {
    document.getElementById("sidebar").classList.add("show");
  });

document.getElementById("sidebarClose")?.addEventListener("click", function () {
  document.getElementById("sidebar").classList.remove("show");
});

document.addEventListener("click", function (event) {
  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebarToggle");

  if (
    window.innerWidth < 992 &&
    !sidebar.contains(event.target) &&
    !sidebarToggle.contains(event.target) &&
    sidebar.classList.contains("show")
  ) {
    sidebar.classList.remove("show");
  }
});

async function confirmReturnOrder(orderId, itemId) {
  try {
    const response = await fetch("/admin/confirm-returnorder", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId, itemId }),
    });

    const result = await response.json();

    if (result.success) {
      Swal.fire({
        title: "Success!",
        text: "The return order has been confirmed.",
        icon: "success",
      }).then(() => location.reload()); // Reload the page after confirmation
    } else {
      Swal.fire({
        title: "Error!",
        text: result.message || "Something went wrong!",
        icon: "error",
      });
    }
  } catch (error) {
    Swal.fire({
      title: "Error!",
      text: "Failed to confirm return order.",
      icon: "error",
    });
  }
}

async function confirmdenyOrder(orderId, itemId) {
  try {
    const response = await fetch("/admin/deny-returnorder", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId, itemId }),
    });

    const result = await response.json();

    if (result.success) {
      Swal.fire({
        title: "Success!",
        text: "Returned Denied.",
        icon: "success",
      }).then(() => location.reload());
    } else {
      Swal.fire({
        title: "Error!",
        text: result.message || "Something went wrong!",
        icon: "error",
      });
    }
  } catch (error) {
    Swal.fire({
      title: "Error!",
      text: "Failed to confirm return order.",
      icon: "error",
    });
  }
}
