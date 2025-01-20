const loadCheckOut = async (req, res) => {
  try {
    res.render("checkOut");
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  loadCheckOut,
};
