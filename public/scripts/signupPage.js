const nameid = document.getElementsByName("name");
const emailid = document.getElementsByName("email");
const phoneid = document.getElementsByName("phone");
const passwordid = document.getElementsByName("password");
const confirmpasswordid = document.getElementsByName("cpassword");
const signupform = document.getElementsByName("signUpForm");

const nameerror = document.getElementById("nameerror");
const emailerror = document.getElementById("emailerror");
const phoneerror = document.getElementById("phoneerror");
const passworderror = document.getElementById("passworderror");
const cpassworderror = document.getElementById("cpassworderror");

function nameValidation(e) {
  const nameval = nameid.value;
  const namePatteren = /^[A-Za-z\s]+$/;

  if (nameval.trim() === "") {
    nameerror.style.display = "block";
    nameerror.innerHTML = "Please enter a valid name";
  } else if (!namePatteren.test(nameval)) {
    nameerror.style.display = "block";
    nameerror.innerHTML = "Name should contain only alphabets";
  } else {
    nameerror.style.display = "none";
    nameerror.innerHTML = "";
  }
}

function emailValidation(e) {
  const emailval = emailid.value;
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

  if (!emailPattern.test(emailval)) {
    emailerror.style.display = "block";
    emailerror.innerHTML = "Please enter a valid email";
  } else {
    emailerror.style.display = "none";
    emailerror.innerHTML = "";
  }
}

function phoneValidation(e) {
  const phoneval = phoneid.value;

  if (phoneval.trim() == "") {
    phoneerror.style.display = "block";
    phoneerror.innerHTML = "Please enter a valid phone number";
  } else if (phoneval.length != 10 || phoneval.length > 10) {
    phoneerror.style.display = "block";
    phoneerror.innerHTML = "Enter 10 digits";
  } else {
    phoneerror.style.display = "none";
    phoneerror.innerHTML = "";
  }
}

function passwordValidation(e) {
  const passid = passwordid;
  const cpassval = confirmpasswordid;
  const alphabetic = /[a-ZA-Z]/;
  const digit = /\d/;
  if (passid < 8) {
    passworderror.style.display = "block";
    passworderror.innerHTML = "Should contain atleast 8 characters";
  } else if (alphabetic.test(passid) || !digit.test(passid)) {
    passworderror.style.display = "block";
    error4.innerHTML = "Should contain numbers and alphabets";
  } else {
    passworderror.style.display = "none";
    passworderror.innerHTML = "";
  }

  if (passid != cpassval) {
    cpassworderror.style.display = "block";
    cpassworderror.innerHTML = "Password do not match";
  } else {
    cpassworderror.style.display = "none";
    cpassworderror.innerHTML = "";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  signupform.addEventListener("submit", function (event) {
    nameValidation();
    emailValidation();
    phoneValidation();
    passwordValidation();

    if (
      !nameid ||
      !emailid ||
      !phoneid ||
      !passwordid ||
      !nameerror ||
      !emailerror ||
      !phoneerror ||
      !passworderror ||
      !cpassworderror
    ) {
      console.log("one or more elements are missing");
    }

    if (
      nameerror.innerHTML ||
      emailerror.innerHTML ||
      phoneerror.innerHTML ||
      passworderror.innerHTML ||
      cpassworderror.innerHTML
    ) {
      event.preventDefault();
    }
  });
});
