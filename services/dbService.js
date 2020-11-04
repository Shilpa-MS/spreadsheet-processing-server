require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const mongodb_url = process.env.MONGODB_URL;
console.log("Mongo DB url is...", mongodb_url);

/****************DB Connection***************** */
mongoose
  .connect(mongodb_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("Connected to MongoDB.....");
  })
  .catch((error) => {
    console.error("Could not connect to MongoDB.... ", error);
  });

/***************************Schema****************************** */

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  role: String,
  access: Array,
});

const User = mongoose.model("user", userSchema, "users");

//User Registration
async function createUser(userJson) {
  try {
    console.log(userJson);
    const flag = await User.findOne({ email: userJson.email });
    if (!flag) {
      const access = userJson.role === "admin" ? true : false;
      userJson.access = [
        {
          service1: access,
        },
        {
          service2: access,
        },
        {
          service3: access,
        },
      ];
      console.log("Now json is...", userJson);
      // const user = new User(userJson);
      // console.log("User ::  ", user);
      // user.save();
      // console.log("Created user successfully!!");
      // return 200;

      bcrypt.hash(userJson.password, 10, async function (err, hash) {
        userJson.password = hash;
        const user = new User(userJson);
        await user.save();
        console.log("Created user successfully");
        return 200;
      });
    } else {
      console.log("Exists!!");
      return 403;
    }
  } catch (err) {
    console.error("Error in user insert..", err);
    return null;
  }
}

//User Authentication
async function authenticateUser(email, password) {
  try {
    const user = await User.findOne({ email: email });
    if (user) {
      const match = await bcrypt.compare(password, user.password);
      // const match = user.password === password ? true : false;
      const statusCode = match ? 200 : 500;
      return {
        statusCode,
        user,
      };
    } else
      return {
        statusCode: 500,
        message: "Wrong email id!",
      };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 404,
      message: "User not found",
    };
  }
}

//get role by email
async function getUserRole(email) {
  console.log("Email is ::: ", email);
  try {
    const user = await User.findOne({ email: email });

    if (user) {
      return { statusCode: 200, role: user.role };
    } else {
      return { statusCode: 404, message: "Role not found" };
    }
  } catch (err) {
    console.log(err);
    return {
      statusCode: 404,
      message: "User not found",
    };
  }
}

//get all users
async function getAllUsers() {
  try {
    const users = await User.find(
      {},
      { firstName: 1, lastName: 1, email: 1, access: 1, _id: 1 }
    );
    return users;
  } catch (err) {
    console.error(err);
  }
}

module.exports = {
  createUser,
  authenticateUser,
  getUserRole,
  getAllUsers,
};
