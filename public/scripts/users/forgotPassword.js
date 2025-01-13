document.addEventListener("DOMContentLoaded", function () {
  const email = document.getElementById("email");
  const form = document.getElementById("forgotPasswordForm");

  // Create error elements for each input
  const createErrorElement = (input) => {
    const errorDiv = document.createElement("div");
    errorDiv.className = "invalid-feedback";
    input.parentNode.appendChild(errorDiv);
    return errorDiv;
  };

  const errorElements = {
    email: createErrorElement(email),
  };

  // Validation patterns
  const patterns = {
    email: /^[a-zA-Z0-9._-]+@[a-zAZ0-9.-]+\.[a-zA-Z]{2,}$/,
  };

  // Error messages
  const errorMessages = {
    email: {
      required: "Please enter your email address",
      pattern: "Please enter a valid email address",
    },
  };

  // Real-time validation
  const validateInput = (input, pattern) => {
    const value = input.value.trim();
    const errorElement = errorElements[input.id];

    // Required field validation
    if (!value) {
      input.classList.add("is-invalid");
      input.classList.remove("is-valid");
      errorElement.textContent = errorMessages[input.id].required;
      return false;
    }

    // Pattern validation
    if (pattern && !pattern.test(value)) {
      input.classList.add("is-invalid");
      input.classList.remove("is-valid");
      errorElement.textContent = errorMessages[input.id].pattern;
      return false;
    }

    input.classList.remove("is-invalid");
    input.classList.add("is-valid");
    errorElement.textContent = "";
    return true;
  };

  // Add input event listener for real-time validation
  email.addEventListener("input", () => validateInput(email, patterns.email));

  form.addEventListener("submit", async function (e) {
    let isValid = true;

    // Validate email field
    const isEmailValid = validateInput(email, patterns.email);
    if (!isEmailValid) {
      isValid = false;
      e.preventDefault();
    }

    if (!isValid) {
      return;
    }
  });
});

setTimeout(function () {
  const alertMessage = document.getElementById("messages");
  if (alertMessage) {
    alertMessage.remove();
  }
}, 3000);
