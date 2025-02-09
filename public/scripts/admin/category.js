function handleFormSubmit(event) {
  event.preventDefault();
  const name = document.getElementById("categoryName").value;
  const description = document.getElementById("categoryDescription").value;
  fetch("/admin/addCategory", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ name, description }),
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
        title: "category Verified Successfully",
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        location.reload();
      });
    })
    .catch((error) => {
      if (error.message === "Category already exists") {
        Swal.fire({
          icon: "error",
          title: "Oops",
          text: "Category already exists",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops",
          text: "An error occurred in adding category",
        });
      }
    });

  // function validateForm() {
  // clearErrorMessages();
  // const name = document.categoryName("categoryDescription")[0].value.trim();
  // const description = document.categoryName("categoryDescription").value.trim();
  // isValid = true;

  // if (name == "") {
  // displayErrorMessage("name-error", "Please enter a name");
  // isValid = false;
  // } else if (!/^[a-zA-Z\s]+$/.test(name)) {
  // displayErrorMessage("name-error", "Name field only contains alphabets");
  // isValid = false;
  // }

  // if (description == "") {
  // displayErrorMessage("description-error", "Please enter a description");
  // isValid = false;
  // }
  // return isValid;
  // }

  function displayErrorMessage(elementId, message) {
    let errorElement = document.getElementById(elementId);
    errorElement.innerText = message;
    errorElement.style.display = "block";
  }

  function clearErrorMessages() {
    let errorElements = document.getElementsByClassName("error-message");
    Array.from(errorElements).forEach((element) => {
      element.innerText = "";
      element.style.display = "none";
    });
  }
}

function deleteCategory(categoryId) {
  Swal.fire({
    title: "Are you sure?",
    text: "You are about to block this user!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, block them!",
  })
    .then((result) => {
      fetch(`/admin/deleteCategory?id=${categoryId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
    })
    .then((data) => {
      Swal.fire({
        icon: "success",
        title: "<strong>Category deleted Successfully!</strong>",
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
        title: "<strong> error occured succesfully!</strong>",
        text: error.message,
        background: "#f9ebeb",
        color: "#a94442",
      });
    });
}

// Sidebar Toggle Functions
document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebarToggle");
  const sidebarClose = document.getElementById("sidebarClose");

  function toggleSidebar() {
    sidebar.classList.toggle("show");
  }

  function closeSidebar() {
    sidebar.classList.remove("show");
  }

  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", toggleSidebar);
  }

  if (sidebarClose) {
    sidebarClose.addEventListener("click", closeSidebar);
  }

  // Close sidebar when clicking outside
  document.addEventListener("click", function (event) {
    const isClickInsideSidebar = sidebar.contains(event.target);
    const isClickOnToggle = sidebarToggle.contains(event.target);

    if (
      !isClickInsideSidebar &&
      !isClickOnToggle &&
      sidebar.classList.contains("show")
    ) {
      closeSidebar();
    }
  });

  // Close sidebar on window resize if in mobile view
  window.addEventListener("resize", function () {
    if (window.innerWidth >= 992 && sidebar.classList.contains("show")) {
      closeSidebar();
    }
  });
});

// Display current date
document.addEventListener("DOMContentLoaded", function () {
  const dateElement = document.getElementById("currentDate");
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const currentDate = new Date().toLocaleDateString("en-US", options);
  dateElement.textContent = currentDate;
});

const removeOffer = async (categoryId) => {
  Swal.fire({
    title: "Are you sure?",
    text: "Do you really want to remove this offer?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, remove it!",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch("/admin/remove-offer", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ categoryId }),
        });

        const data = await response.json();

        if (data.success) {
          Swal.fire("Removed!", "The offer has been removed.", "success").then(
            () => {
              location.reload();
            }
          );
        } else {
          Swal.fire("Error!", data.message || "Something went wrong.", "error");
        }
      } catch (error) {
        Swal.fire("Error!", "Failed to remove the offer.", "error");
      }
    }
  });
};

function validateOfferForm(categoryId) {
  const percentage = document.getElementById(`percentage_${categoryId}`);
  const endDate = document.getElementById(`endDate_${categoryId}`);
  let isValid = true;

  // Validate percentage
  const percentageValue = parseInt(percentage.value);
  if (isNaN(percentageValue) || percentageValue < 1 || percentageValue > 100) {
    percentage.classList.add("is-invalid");
    isValid = false;
  } else {
    percentage.classList.remove("is-invalid");
  }

  // Validate end date
  const selectedDate = new Date(endDate.value);
  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (!endDate.value || selectedDate < tomorrow) {
    endDate.classList.add("is-invalid");
    isValid = false;
  } else {
    endDate.classList.remove("is-invalid");
  }

  return isValid;
}

function addOffer(categoryId) {
  if (!validateOfferForm(categoryId)) {
    return;
  }

  const percentage = document.getElementById(`percentage_${categoryId}`).value;
  const endDate = document.getElementById(`endDate_${categoryId}`).value;

  fetch("/admin/add-category-offer", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      categoryId,
      offerPercentage: percentage,
      endDate,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const modal = bootstrap.Modal.getInstance(
          document.getElementById(`addOfferModal_${categoryId}`)
        );
        modal.hide();

        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Offer added successfully",
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          window.location.reload();
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: data.message || "Failed to add offer",
        });
      }
    })
    .catch((error) => {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to add offer. Please try again.",
      });
    });
}

document.addEventListener("DOMContentLoaded", function () {
  const offerModals = document.querySelectorAll('[id^="addOfferModal_"]');

  offerModals.forEach((modal) => {
    const categoryId = modal.id.split("_")[1];
    const percentage = document.getElementById(`percentage_${categoryId}`);
    const endDate = document.getElementById(`endDate_${categoryId}`);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split("T")[0];
    endDate.min = minDate;

    percentage.addEventListener("input", function () {
      const value = this.value;
      if (value && (value < 1 || value > 100)) {
        this.classList.add("is-invalid");
      } else {
        this.classList.remove("is-invalid");
      }
    });

    endDate.addEventListener("input", function () {
      const selectedDate = new Date(this.value);
      const tomorrow = new Date();
      tomorrow.setHours(0, 0, 0, 0);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (selectedDate < tomorrow) {
        this.classList.add("is-invalid");
      } else {
        this.classList.remove("is-invalid");
      }
    });
  });
});
