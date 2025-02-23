document.addEventListener("DOMContentLoaded", function () {
  const otpInput = document.querySelector(".otp-input");
  const resendButton = document.getElementById("resendOTP");
  const timerSpan = document.getElementById("timer");

  let timerInterval;

  function startTimer(duration = 60) {
    const endTime = Date.now() + duration * 1000;
    sessionStorage.setItem("otpTimerEnd", endTime);

    updateTimer(duration);
    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
      let timeLeft = Math.floor((endTime - Date.now()) / 1000);

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        timerExpired();
        return;
      }

      updateTimer(timeLeft);
    }, 1000);
  }

  function updateTimer(timeLeft) {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerSpan.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    resendButton.style.display = "none";
    timerSpan.parentElement.parentElement.style.display = "block";
  }

  function timerExpired() {
    resendButton.style.display = "inline";
    timerSpan.parentElement.parentElement.style.display = "none";
    sessionStorage.removeItem("otpTimerEnd"); // Remove expired timer
  }

  let storedEndTime = sessionStorage.getItem("otpTimerEnd");
  let timerEnd = storedEndTime ? parseInt(storedEndTime) : null;

  if (timerEnd && Date.now() < timerEnd) {
    let remainingTime = Math.floor((timerEnd - Date.now()) / 1000);
    startTimer(remainingTime);
  } else {
    startTimer();
  }

  // Handle resend OTP click
  resendButton.addEventListener("click", function (e) {
    e.preventDefault();
    startTimer(); // Restart timer on resend
    otpInput.value = ""; // Clear the OTP input
    otpInput.focus();
  });
});




function validateOtp() {
  const otp = document.getElementById("otp").value;

  if (!otp) {
    Swal.fire({
      icon: "error",
      title: "Invalid OTP",
      text: "Please enter a valid OTP.",
      showConfirmButton: true,
    });
    return false;
  }

  $.ajax({
    type: "POST",
    url: "verify-otp",
    data: { otp: otp },
    success: function (response) {
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "OTP Verified Successfully",
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          window.location.href = response.redirectUrl;
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    },
    error: function () {
      Swal.fire({
        icon: "error",
        title: "invalid OTP",
        text: "Please try again",
        showConfirmButton: false,
        timer: 1500,
      });
    },
  });
  return false;
}

function resendOtp() {
  $.ajax({
    type: "POST",
    url: "resend-otp",
    success: function (response) {
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Otp resended successfully",
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "error",
          text: "An error occured while resending otp! please try again",
        });
      }
    },
  });
  return false;
}
