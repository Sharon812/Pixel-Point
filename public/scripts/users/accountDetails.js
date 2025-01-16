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
      window.reload;
    });
  }

  const updatedUser = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
  };

  try {
    const response = await fetch(`/accountDetails/${userID}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedUser),
    });

    const data = await response.json();
    console.log("Response data:", data);

    if (response.ok) {
      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: data.message || "User details updated successfully!",
        timer: 1500,
      }).then(() => {
        window.location.reload();
      });

      inputs.forEach((input) => input.setAttribute("readonly", true));
      editBtn.style.display = "inline-block";
      saveBtn.style.display = "none";
    } else {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: data.message || "Updating user details failed!",
        showConfirmButton: true,
      });
    }
  } catch (error) {
    console.error("Error updating user details:", error);

    Swal.fire({
      icon: "error",
      title: "Error!",
      text: "Something went wrong. Please try again later.",
      showConfirmButton: true,
    });
  }
}
