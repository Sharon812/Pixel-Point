function toggleAddressModal() {
  const modal = document.getElementById("addressModal");
  modal.classList.toggle("hidden");
}

function selectAddress(addressId) {
  // Perform an action to select the address (e.g., update it via an API call)
  console.log(`Selected Address ID: ${addressId}`);
}
