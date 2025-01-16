document
  .getElementById("addAddressForm")
  .addEventListener("submit", function (e) {
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

    //landmark
    const landmark = document.getElementById("landmark");
    if (!landmark.value.trim()) {
      document.getElementById("landMarkError").textContent =
        "Landmark is required";
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

    const altPhone = document.getElementById("alt-phone");
    if (!altPhone.value.match(/^\d{10}$/)) {
      document.getElementById("altPhoneError").textContent =
        "Alternate phone number must be a 10-digit number.";
      isValid = false;
    }

    // Prevent form submission if any validation fails
    if (!isValid) {
      e.preventDefault(); // Stop form submission
      console.log("Form submission prevented due to validation errors.");
    }
  });
