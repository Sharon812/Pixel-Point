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
          window.location.href = "/address";
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
