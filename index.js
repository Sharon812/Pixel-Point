const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const env = require("dotenv").config();
const db = require("./config/db");
const passport = require("./config/passport");
const adminSide = require("./routes/admin/adminRoute");
const userSide = require("./routes/user/userRoute");
const adminSession = require("./middlewares/adminSessionAuth");
const userAuth = require("./middlewares/userAuth");
db();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const resetCoupons = require("./helpers/couponReset")
const resetCategoryOffer = require("./helpers/offerReset")
const resetProductOffer = require("./helpers/productOfferReset")
const cron = require("node-cron")

cron.schedule("0 0 * * *",async () => {
  try {
    const date = new Date()
    console.log(`cron job started ${date} `)

    await resetCoupons()
    await resetCategoryOffer()
    await resetProductOffer()

  } catch (error) {
    console.error("error at cron in index.js",error)
  }
})

//configuring session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, //use true while production
      httpOnly: true,
      maxAge: 72 * 60 * 1000, //72 hours
    },
  })
);

//google auth middleware
app.use(passport.initialize());
app.use(passport.session());

//middleware for not caching
app.use((req, res, next) => {
  res.set("cache-control", "no-store");
  next();
});

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", [
  path.join(__dirname, "/views/users"),
  path.join(__dirname, "/views/admin"),
]);

//setting up admin route
app.use("/admin", adminSession, adminSide);

//setting up user routee
app.use("/", userAuth.blockedUser, userSide);

app.listen(process.env.PORT, "0.0.0.0", () => {
  console.log("server running");
});
