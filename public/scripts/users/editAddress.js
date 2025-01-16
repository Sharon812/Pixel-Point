async function handleFormSubmit(objId) {
  event.preventDefault(); // Prevent default form submission

  // Start by assuming the form is valid
  let isValid = true;

  // Clear previous error messages
  document
    .querySelectorAll(".error-message")
    .forEach((el) => (el.textContent = ""));

  // Form field validation

  // House Name
  const houseName = document.getElementById("houseName");
  if (!houseName.value.trim()) {
    document.getElementById("houseNameError").textContent =
      "House name is required.";
    isValid = false;
  }

  // Address Type
  const addressType = document.getElementById("type");
  if (!addressType.value) {
    document.getElementById("addressTypeError").textContent =
      "Please select an address type.";
    isValid = false;
  }

  // City
  const city = document.getElementById("city");
  if (!city.value.trim()) {
    city.nextElementSibling.textContent = "City is required.";
    isValid = false;
  }

  // State
  const state = document.getElementById("state");
  if (!state.value.trim()) {
    document.getElementById("stateError").textContent = "State is required.";
    isValid = false;
  }

  // Landmark
  const landmark = document.getElementById("landmark");
  if (!landmark.value.trim()) {
    document.getElementById("landMarkError").textContent =
      "Landmark is required.";
    isValid = false;
  }

  // Pincode
  const pincode = document.getElementById("pincode");
  if (!pincode.value.match(/^\d{6}$/)) {
    document.getElementById("pincodeError").textContent =
      "Pincode must be a 6-digit number.";
    isValid = false;
  }

  // Phone Number
  const phone = document.getElementById("phone");
  if (!phone.value.match(/^\d{10}$/)) {
    document.getElementById("phoneError").textContent =
      "Phone number must be a 10-digit number.";
    isValid = false;
  }

  // Alternate Phone
  const altPhone = document.getElementById("alt-phone");
  if (!altPhone.value.match(/^\d{10}$/)) {
    document.getElementById("altPhoneError").textContent =
      "Alternate phone number must be a 10-digit number.";
    isValid = false;
  }

  if (!isValid) {
    // Display SweetAlert for validation errors
    Swal.fire({
      icon: "error",
      title: "Validation Error",
      text: "Please fix the errors and try again.",
    });
    console.log("Form submission prevented due to validation errors.");
    return; // Stop further execution
  }

  // If the form is valid, prepare query parameters for submission
  const formData = {
    houseName: houseName.value.trim(),
    type: addressType.value,
    city: city.value.trim(),
    state: state.value.trim(),
    landmark: landmark.value.trim(),
    pincode: pincode.value,
    phone: phone.value,
    altPhone: altPhone.value,
  };

  try {
    // Submit the data using fetch via URL query string
    const response = await fetch(`/editAddress/${objId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    // Handle server response
    if (response.ok) {
      const result = await response.json();
      Swal.fire({
        icon: "success",
        title: "Success",
        timer: 1500,
        showConfirmButton: false,
        text: result.message || "Address updated successfully!",
      }).then(() => {
        window.location.href = "/address";
      });
    } else {
      const error = await response.json();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to update the address.",
      });
    }
  } catch (error) {
    // Handle network or server errors
    Swal.fire({
      icon: "error",
      title: "Network Error",
      text: "An error occurred while submitting the form. Please try again.",
    });
  }
}
