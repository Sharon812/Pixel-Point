const editBtn = document.getElementById("editBtn");
const saveBtn = document.getElementById("saveBtn");
const inputs = document.querySelectorAll("input");

editBtn.addEventListener("click", () => {
  inputs.forEach((input) => input.removeAttribute("readonly"));
  editBtn.style.display = "none";
  saveBtn.style.display = "inline-block";
});

async function updateDetails(event, userID) {
  event.preventDefault();
  console.log("updateDetails function triggered!");
  if (!userID) {
    console.error("User ID is not provided");
    Swal.fire({
      icon: "error",
      title: "Error!",
      text: "User ID is missing. Cannot update details.",
      timer: 1500,
    }).then(() => {
      window.location.reload();
    });
    return; // Exit the function if no userID is provided.
  }

  const updatedUser = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
  };

  const nameErrorEl = document.getElementById("nameError");
  const emailErrorEl = document.getElementById("emailError");
  const phoneErrorEl = document.getElementById("phoneError");

  if (nameErrorEl) nameErrorEl.textContent = "";
  if (emailErrorEl) emailErrorEl.textContent = "";
  if (phoneErrorEl) phoneErrorEl.textContent = "";

  function validateUser(user) {
    const nameRegex = /^(?!.*\d)(?=.*[A-Za-z]).+$/;
    const emailRegex = /^\S+@\S+\.\S+$/;
    const phoneRegex = /^\d{10}$/;

    if (!nameRegex.test(user.name)) {
      if (nameErrorEl) nameErrorEl.textContent = "Enter a valid name";
      return false;
    }

    if (!emailRegex.test(user.email)) {
      if (emailErrorEl) emailErrorEl.textContent = "Enter a valid email";
      return false;
    }

    if (user.phone.trim() === "" || !phoneRegex.test(user.phone)) {
      if (phoneErrorEl)
        phoneErrorEl.textContent = "Enter a valid phone number (10 digits)";
      return false;
    }
    return true;
  }

  if (validateUser(updatedUser)) {
    try {
      const response = await fetch(`/accountDetails/${userID}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUser),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Success!",
          text: data.message || "An error occurred. Please try again.",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          customClass: {
            popup: "colored-toast",
            icon: "success-icon",
          },
        }).then(() => {
          window.location.reload();
        });

        // Assuming inputs, editBtn, saveBtn are defined somewhere
        inputs.forEach((input) => input.setAttribute("readonly", true));
        editBtn.style.display = "inline-block";
        saveBtn.style.display = "none";
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
      console.error("Error updating user details:", error);
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
  }
}
