function handleFormSubmit(event) {
  event.preventDefault();

  if (!validateForm()) {
    return;
  }
  const name = document.getElementsByName("name")[0].value;
  const description = document.getElementById("description").value;

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

  function validateForm() {
    clearErrorMessages();
    const name = document.getElementsByName("name")[0].value.trim();
    const description = document.getElementById("description").value.trim();
    isValid = true;

    if (name == "") {
      displayErrorMessage("name-error", "Please enter a name");
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(name)) {
      displayErrorMessage("name-error", "Name field only contains alphabets");
      isValid = false;
    }

    if (description == "") {
      displayErrorMessage("description-error", "Please enter a description");
      isValid = false;
    }
    return isValid;
  }

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
