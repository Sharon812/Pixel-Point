function editCategory(categoryId) {
  const name = document.getElementById("name").value;
  const description = document.getElementById("description").value;

  fetch(`/admin/editCategory/${categoryId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      categoryname: name,
      description: description,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((err) => {
          throw new Error(err.error);
        });
      }
      return response.json();
    })
    .then((data) => {
      Swal.fire({
        icon: "success",
        title: "Category Updated Successfully!",
        showConfirmButton: false,
        timer: 2000,
      }).then(() => {
        window.location.href = "/admin/category";
      });
    })
    .catch((err) => {
      Swal.fire({
        icon: "error",
        title: err.message || "Some error occurred!",
        showConfirmButton: false,
        timer: 2000,
      });
    });
  return false;
}
