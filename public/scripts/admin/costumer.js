// Set current date
document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
});

// Create overlay element
const overlay = document.createElement('div');
overlay.className = 'sidebar-overlay';
document.body.appendChild(overlay);

// Mobile sidebar functionality
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarClose = document.getElementById('sidebarClose');

function toggleSidebar(show = true) {
    sidebar.classList.toggle('show', show);
    overlay.classList.toggle('show', show);
    document.body.style.overflow = show ? 'hidden' : '';
}

// Toggle sidebar on hamburger click
if (sidebarToggle) {
    sidebarToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSidebar(true);
    });
}

// Close sidebar on close button click
if (sidebarClose) {
    sidebarClose.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSidebar(false);
    });
}

// Close sidebar when clicking overlay
overlay.addEventListener('click', () => {
    toggleSidebar(false);
});

// Prevent clicks inside sidebar from closing it
sidebar.addEventListener('click', (e) => {
    e.stopPropagation();
});

function blockUser(userId) {
  Swal.fire({
    title: "Are you sure?",
    text: "You are about to block this user!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, block them!",
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`/admin/block-user?id=${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((err) => {
              throw new Error(err.error);
            });
          }
          return response.json();
        })
        .then((data) => {
          Swal.fire({
            icon: "success",
            title: "<strong>User Blocked Successfully!</strong>",
            toast: true,
            position: "top-end",
            background: "#f0f9eb",
            color: "#3c763d",
            showConfirmButton: false,
            timer: 1200,
            timerProgressBar: true,
          }).then(() => {
            location.reload();
          });
        })
        .catch((error) => {
          // Handle errors
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: error.message,
            background: "#f9ebeb",
            color: "#a94442",
          });
        });
    }
  });
}

function unblockUser(userId) {
  Swal.fire({
    title: "Are you sure?",
    text: "You are about to unblock this user!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, unblock them!",
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`/admin/unblock-user?id=${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((err) => {
              throw new Error(err.error);
            });
          }
          return response.json();
        })
        .then((data) => {
          Swal.fire({
            icon: "success",
            title: "<strong>User unBlocked Successfully!</strong>",
            toast: true,
            position: "top-end",
            background: "#f0f9eb",
            color: "#3c763d",
            showConfirmButton: false,
            timer: 1200,
            timerProgressBar: true,
          }).then(() => {
            location.reload();
          });
        })
        .catch((error) => {
          // Handle errors
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: error.message,
            background: "#f9ebeb",
            color: "#a94442",
          });
        });
    }
  });
}
