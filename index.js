const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const env = require("dotenv").config();
const db = require("./config/db");
const passport = require('./config/passport')
const adminSide = require("./routes/admin/adminRoute");
const userSide = require("./routes/user/userRoute");
db();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
app.use(passport.session())


//middleware for not caching 
app.use((req,res,next) => {
  res.set('cache-control', 'no-store')
  next()
})

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", [
  path.join(__dirname, "/views/users"),
  path.join(__dirname, "/views/admin"),
]);

//setting up admin route
app.use("/admin", adminSide);

//setting up user routee 
app.use("/", userSide);

app.listen(process.env.PORT, () => {
  console.log("server running");
});
