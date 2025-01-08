document.getElementById("emailForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const emailInput = document.getElementById("email").value;
  const passwordInput = document.getElementById("passwordInput").value;

  const messageElement = document.getElementById("message");
  const passwordMess = document.getElementById("passwordMessage");

  let isValid = true;

  const gmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!gmailRegex.test(emailInput)) {
    messageElement.textContent = "Invalid Gmail address";
    messageElement.style.color = "red";
    isValid = false;
  } else {
    messageElement.textContent = "";
  }

  if (passwordInput.trim() === "") {
    passwordMess.textContent = "Password cannot be empty";
    passwordMess.style.color = "red";
    isValid = false;
  } else if (passwordInput.length < 8) {
    passwordMess.textContent = "Password must be at least 8 characters long";
    passwordMess.style.color = "red";
    isValid = false;
  } else {
    passwordMess.textContent = "";
  }

  if (isValid) {
    e.target.submit();
  }
});

//for clearing server messagesS
setTimeout(() => {
  const messageElement = document.getElementById("messagess");
  if (messageElement) {
    messageElement.style.display = "none";
  }
}, 5000);
