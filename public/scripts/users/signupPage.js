document.getElementById("signUpForm").addEventListener("submit",async function (e) {
  e.preventDefault();
  console.log(typeof Swal);

  const nameid = document.getElementById("name").value.trim();
  const emailid = document.getElementById("email").value.trim();
  const phoneid = document.getElementById("phone").value.trim();
  const passwordid = document.getElementById("password").value;
  const confirmpasswordid = document.getElementById("cpassword").value;
  const refferalCode = document.getElementById("refferalCode").value.trim();


  const nameerror = document.getElementById("nameerror");
  const emailerror = document.getElementById("emailerror");
  const phoneerror = document.getElementById("phoneerror");
  const passworderror = document.getElementById("passworderror");
  const cpassworderror = document.getElementById("cpassworderror");

  let isValid = true;

  // Name Validation
  const namePattern = /^[a-zA-Z\s]+$/;
  if (nameid === "") {
    nameerror.style.display = "block";
    nameerror.textContent = "Please enter a valid name";
    nameerror.style.color = "red";
    isValid = false;
  } else if (!namePattern.test(nameid)) {
    nameerror.style.display = "block";
    nameerror.textContent = "Name should contain only alphabets and spaces";
    nameerror.style.color = "red";
    isValid = false;
  } else {
    nameerror.style.display = "none";
  }

  // Email Validation
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  if (!emailPattern.test(emailid)) {
    emailerror.style.display = "block";
    emailerror.textContent = "Please enter a valid email";
    emailerror.style.color = "red";
    isValid = false;
  } else {
    emailerror.style.display = "none";
  }

  // Phone Validation
  if (phoneid === "" || phoneid.length !== 10 || isNaN(phoneid)) {
    phoneerror.style.display = "block";
    phoneerror.textContent = "Enter a valid 10-digit phone number";
    phoneerror.style.color = "red";
    isValid = false;
  } else {
    phoneerror.style.display = "none";
  }

  // Password Validation
  const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
  if (!passwordPattern.test(passwordid)) {
    passworderror.style.display = "block";
    passworderror.textContent =
      "Password must be at least 8 characters long and contain both letters and numbers";
    passworderror.style.color = "red";
    isValid = false;
  } else {
    passworderror.style.display = "none";
  }

  // Confirm Password Validation
  if (passwordid !== confirmpasswordid) {
    cpassworderror.style.display = "block";
    cpassworderror.textContent = "Passwords do not match";
    cpassworderror.style.color = "red";
    isValid = false;
  } else {
    cpassworderror.style.display = "none";
  }

  // Submit Form if Valid
  if (isValid) {
    try {
      const response = await fetch("/signup",{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body:JSON.stringify({
          name:nameid,
          phone:phoneid,
          email:emailid,
          password:passwordid,
          refferalCode:refferalCode
        })
      })
      const result = await response.json()
      if (!result.success) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "error",
          title: "Error!",
          text: result.message || "An error occurred. Please try again.",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          customClass: {
            popup: "colored-toast error-toast",
            icon: "error-icon",
          },
        });
      } else {
        window.location.href = result.redirectUrl;
      }

    } catch (error) {
      console.log(error,"error at sumbitting signup form")
    }
  }
});


