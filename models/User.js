const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

//user schema
const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  profilePic: { type: String },
  password: {
    type: String,
    required: true,
  },
  userVerified: {
    type: Boolean,
    required: true,
    default: false,
  },
  emailToken: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    enum: ["user", "moderator"],
    default: "user",
  },
  gender: {
    type: String,
    enum: ["M", "F"],
  },
  articles: [{ type: mongoose.Schema.Types.ObjectId, ref: "article" }],
  createdOn: {
    type: Date,
    default: new Date(),
  },
  bookmarked: [{ type: mongoose.Schema.Types.ObjectId, ref: "article" }],
});

let User = mongoose.models.user || mongoose.model("user", userSchema);

//add user
User.addUser = (newUser, callback) => {
  hashPassword(newUser.password, (hashedPassword) => {
    newUser.password = hashedPassword;
    newUser.save(callback);
  });
};

// hash password
User.hashPassword = (password, callback) => {
  bcrypt.genSalt(12, (err, salt) =>
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) throw err;
      else {
        callback(hash);
      }
    })
  );
};

//compare password
User.comparePassword = (password, hash, callback) => {
  bcrypt.compare(password, hash, (err, isMatch) => {
    if (err) throw err;
    else callback(null, isMatch);
  });
};

module.exports = User;
