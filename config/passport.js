const passport = require("passport");
const googleStratergy = require("passport-google-oauth20").Strategy;
const User = require("../models/userSchema");
const env = require("dotenv").config();

//initialising
passport.use(
  new googleStratergy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRECTKEY,
      callbackURL: "/auth/google/callback",
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value.toLowerCase();
        let user = await User.findOne({ email: email });
        if (user) {
          return done(null, user);
        } else {
          user = new User({
            name: profile.displayName,
            email: email,
            googleId: profile.id,
          });
          await user.save();
          return done(null, user);
        }
      } catch (error) {
        return done(error, null);
      }
    }
  )
);
//to assign user details to session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

//to fethch user data from session
passport.deserializeUser((id, done) => {
  User.findById(id)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err, null);
    });
});

module.exports = passport;
