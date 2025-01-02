const User = require("../../models/userSchema");

const userInfo = async (req, res) => {
  try {
    //for search
    let search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    //for pagination
    let page = 1;
    if (req.query.page) {
      page = parseInt(req.query.page);
    }

    const limit = 3;
    const userData = await User.find({
      isAdmin: false,
      $or: [
        { name: { $regex: ".*" + search + ".*" } },
        { email: { $regex: ".*" + search + ".*" } },
      ],
    })
      .sort({ createdOn: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await User.find({
      isAdmin: false,
      $or: [
        { name: { $regex: ".*" + search + ".*" } },
        { email: { $regex: ".*" + search + ".*" } },
      ],
    }).countDocuments();

    const totalPages = Math.ceil(count / limit);

    res.render("adminUsers", {
      data: userData,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.log(error);
    res.redirect("/page-not-found");
  }
};

//for blocking user
const userBlocked = async (req, res) => {
  try {
    let id = req.query.id;
    await User.updateOne({ _id: id }, { $set: { isBlocked: true } });
    res.redirect("/admin/users");
  } catch (error) {
    res.redirect("/page-not-found");
  }
};

//for unblocking user
const userUnblocked = async (req, res) => {
  try {
    let id = req.query.id;
    await User.updateOne({ _id: id }, { $set: { isBlocked: false } });
    res.redirect("/admin/users");
  } catch (error) {
    res.redirect("/page-not-found");
  }
};

module.exports = {
  userInfo,
  userUnblocked,
  userBlocked,
};
