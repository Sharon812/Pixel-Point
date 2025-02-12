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
      .sort({ CreatedOn: -1 })
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
      currentPage:"users"

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
    const result = await User.updateOne(
      { _id: id },
      { $set: { isBlocked: true } }
    );
    return res.json({ response: "user blocked successfully" });
  } catch (error) {
    console.log(("error at blocking user", error));
    res.status(500).json({ response: "an error try again" });
  }
};

//for unblocking user
const userUnblocked = async (req, res) => {
  try {
    let id = req.query.id;
    await User.updateOne({ _id: id }, { $set: { isBlocked: false } });
    return res.json({ response: "user unblocked successfully" });
  } catch (error) {
    console.log("error at unblocking user", error);
    res.status(500).json({ response: "an error try again" });
  }
};

module.exports = {
  userInfo,
  userUnblocked,
  userBlocked,
};
