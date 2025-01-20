let currentProductCount = 6;

function submitFilters() {
  document.getElementById("filtersForm").submit();
}

function clearFilters() {
  document.getElementById("search").value = "";
  document.getElementById("category").value = "";
  document.getElementById("brand").value = "";
  document.getElementById("priceRange").value = "";
  document.getElementById("ram").value = "";
  document.getElementById("storage").value = "";
  document.getElementById("color").value = "";
  document
    .querySelectorAll('input[name="sort"]')
    .forEach((input) => (input.checked = false));
  document.getElementById("filtersForm").submit();
}
