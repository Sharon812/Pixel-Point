document.addEventListener("DOMContentLoaded", function () {
  const sidebarToggle = document.getElementById("sidebarToggle");
  const sidebarClose = document.getElementById("sidebarClose");
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.querySelector(".main-content");

  function toggleSidebar() {
    sidebar.classList.toggle("show");
  }

  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", toggleSidebar);
  }

  if (sidebarClose) {
    sidebarClose.addEventListener("click", toggleSidebar);
  }

  document.addEventListener("click", function (event) {
    const isClickInsideSidebar = sidebar.contains(event.target);
    const isClickOnToggle = sidebarToggle.contains(event.target);

    if (
      !isClickInsideSidebar &&
      !isClickOnToggle &&
      sidebar.classList.contains("show")
    ) {
      sidebar.classList.remove("show");
    }
  });

  document.getElementById("currentDate").textContent =
    new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  function handleResize() {
    const width = window.innerWidth;
    const ordersChartHeight = width < 768 ? "300px" : "400px";
    const revenueChartHeight = width < 768 ? "250px" : "300px";

    document.getElementById("ordersChart").parentElement.style.height =
      ordersChartHeight;
    document.getElementById("revenueChart").parentElement.style.height =
      revenueChartHeight;
  }

  handleResize();
  window.addEventListener("resize", handleResize);

  const ordersCtx = document.getElementById("ordersChart").getContext("2d");
  new Chart(ordersCtx, {
    type: "line",
    data: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          label: "Orders",
          data: [65, 59, 80, 81, 56, 55],
          borderColor: "#4e73df",
          tension: 0.3,
          fill: true,
          backgroundColor: "rgba(78, 115, 223, 0.05)",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            borderDash: [2],
            drawBorder: false,
          },
        },
        x: {
          grid: {
            display: false,
          },
        },
      },
    },
  });

  const revenueCtx = document.getElementById("revenueChart").getContext("2d");
  new Chart(revenueCtx, {
    type: "doughnut",
    data: {
      labels: ["Electronics", "Clothing", "Accessories", "Others"],
      datasets: [
        {
          data: [35, 25, 20, 20],
          backgroundColor: ["#4e73df", "#1cc88a", "#36b9cc", "#f6c23e"],
          hoverOffset: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
      cutout: "70%",
    },
  });
});
