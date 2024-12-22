const express = require("express");
const app = express();
const path = require("path");
const env = require("dotenv").config();
const db = require("./config/db");
const adminSide = require("./routes/adminroute");
const userSide = require("./routes/userRoute");
db();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", [
  path.join(__dirname, "views/users"),
  path.join(__dirname, "views/admin"),
]);

//setting up admin route
app.use("/admin", adminSide);

//setting up user route
app.use("/", userSide);

app.listen(process.env.PORT, () => {
  console.log("server running");
});
