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

/***************************User****************************** */

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  role: String,
  access: Array,
  parentOu: String,
  subOu: String,
  accountName: String,
  secret_quesOne: String,
  secret_ansOne: String,
  secret_quesTwo: String,
  secret_ansTwo: String,
  isApproved: Boolean,
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
          solution1: access,
          status: "Not Requested",
        },
        {
          solution2: access,
          status: "Not Requested",
        },
        {
          solution3: access,
          status: "Not Requested",
        },
      ];
      userJson.isApproved = false;

      console.log("Now json is...", userJson);

      const salt = bcrypt.genSaltSync(10),
        hash = bcrypt.hashSync(userJson.password, salt);

      hash1 = bcrypt.hashSync(userJson.ansOne, salt);

      hash2 = bcrypt.hashSync(userJson.ansTwo, salt);

      userJson.password = hash;
      userJson.securityanswer_one = hash1;
      userJson.securityanswer_two = hash2;
      const user = new User(userJson);
      await user.save();
      console.log("Created user successfully");
      return 200;
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
      return { statusCode: 200, role: user.role, user: user };
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
    const users = await User.find({ isApproved: true });
    return users;
  } catch (err) {
    console.error(err);
  }
}

//get pending users
async function getPendingUsers() {
  try {
    const users = await User.find({ isApproved: false });
    return users;
  } catch (err) {
    console.error(err);
  }
}

//edit/request access
async function authorizeUser(userJson) {
  try {
    const user = await User.findOne({ email: userJson.email });
    user.access = userJson.access;
    user.isApproved = userJson.isApproved;
    if (user.access[0].solution1 === true) user.access[0].status === "Approved";
    if (user.access[1].solution2 === true) user.access[1].status === "Approved";
    if (user.access[2].solution3 === true) user.access[2].status === "Approved";

    user.save();
    return 200;
  } catch (e) {
    console.error(e);
  }
}

/***********************************Solutions****************************** */

const solutionSchema = new mongoose.Schema({
  title: String,
  description: String,
  deploymentOptions: Array,
});

const Solution = mongoose.model("solution", solutionSchema, "solutions");

//Get all solutions
async function getAllSolutions() {
  try {
    const solutions = await Solution.find({});
    return solutions;
  } catch (err) {
    console.error(err);
  }
}

/************************Ou data**************************** */
const ouSchema = new mongoose.Schema({
  ouList: Array,
});

const OUmodel = mongoose.model("ou", ouSchema, "dropdown_data");

//Get all ou data
async function getAllOu() {
  try {
    const ou = await OUmodel.find({});
    return ou;
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  createUser,
  authenticateUser,
  getUserRole,
  getAllUsers,
  authorizeUser,
  getAllSolutions,
  getPendingUsers,
  getAllOu,
};
