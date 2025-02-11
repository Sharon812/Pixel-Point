document.addEventListener('DOMContentLoaded', function() {
    const preloader = document.getElementById('preloader');
    
    window.addEventListener('load', function() {
        preloader.classList.add('fade-out');
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    });
});
