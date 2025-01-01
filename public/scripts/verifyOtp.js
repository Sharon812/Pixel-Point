let timerElement = document.getElementById('timer');
let resendLink = document.getElementById('resend-link');
let timeLeft = 120; // 2 minutes in seconds

const updateTimer = () => {
    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;
    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    if (timeLeft > 0) {
        timeLeft--;
    } else {
        resendLink.classList.remove('disabled');
    }
};

resendLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (resendLink.classList.contains('disabled')) return;

    // Simulate OTP resend logic here
    alert('OTP has been resent!');

    timeLeft = 120; // Reset the timer
    resendLink.classList.add('disabled');
});

resendLink.classList.add('disabled'); // Disable resend initially
setInterval(updateTimer, 1000);

// document.getElementById('otp-form').addEventListener('submit', (e) => {
//     e.preventDefault();
//     const otp = document.getElementById('otp-input').value;

//     if (otp.length === 6) {
//         alert('OTP Verified Successfully!');
//     } else {
//         alert('Invalid OTP. Please try again.');
//     }
// });

function validateOTP() {

  const otp = document.getElementById('otp-input').value
  
  $.ajax({
    type:"POST",
    url:"verify-otp",
    data:({otp:otp}),
    success: function (response){
      if(response.success){
        // Swal.fire({
        //   icon:"success",
        //   title:"Otp verifed successfully",
        //   showConfirmButton:false,
        //   timer:1500,
        // }).then(()  => {
          console.log("Redirecting to:", response.redirectUrl);
          window.location.href = '/login';
          // })

      }else{
        Swal.fire({
          icon:"error",
          title:"Error",
          text:response.message,
        })
      }
    },
    error:function (){
      Swal.fire({
        icon:"Error",
        title:"Invalid otp",
        text:"Please try again"  
      })
    }
  })
  return false;
}


