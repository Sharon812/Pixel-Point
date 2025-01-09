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
