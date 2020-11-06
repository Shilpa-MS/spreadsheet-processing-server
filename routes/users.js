const express = require("express");
const router = express.Router();
const dbService = require("../services/dbService");
const responses = require("../responses.json");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

router.get("/", (req, res) => {
  res.status(200).send("Users route is running");
});

const DIR = "./uploads";

//store
const store = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, DIR);
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.toLowerCase().split(" ").join("-");
    cb(null, uuidv4() + "-" + fileName);
  },
});

//initialise multer with disk storage
let upload = multer({ storage: store }).single("csvFile");

//create new user
router.post("/register", async (req, res) => {
  const registrationSuccess = responses.registrationSuccess;
  const userExists = responses.userExists;
  const failed = responses.failed;
  const user = req.body;
  const result = await dbService.createUser(user);
  console.log("Req", user);
  if (result !== null) {
    if (result !== 403) res.status(200).send({ registrationSuccess, user });
    else res.status(200).send({ userExists });
  } else res.status(400).send({ failed });
});

//login
router.post("/authenticate", async (req, res) => {
  const { email, password } = req.body;
  const result = await dbService.authenticateUser(email, password);
  console.log(result);
  if (result.statusCode === 200) {
    res.status(200).send({ flag: true, message: "Login success!!", result });
  } else if (result.statusCode === 500) {
    res.status(200).send({ flag: false, message: "Wrong email/password!!" });
  } else res.status(400).send("User does not exist!!");
});

//get role by Id
router.post("/get-user", async (req, res) => {
  const email = req.body.email;
  const result = await dbService.getUserRole(email);
  console.log("Get User Result is ::: ", result);
  if (result.statusCode === 200) {
    res.status(200).send(result);
  } else {
    res.status(200).send("not found");
  }
});

//get all users
router.post("/getAllUsers", async (req, res) => {
  const result = await dbService.getAllUsers();
  res.status(200).send(result);
});

//get pending users
router.post("/getPendingUsers", async (req, res) => {
  const result = await dbService.getPendingUsers();
  res.status(200).send(result);
});

//file upload
router.post("/upload", function (req, res, next) {
  upload(req, res, function (err) {
    if (err) {
      console.error("Error in upload....", err);
      return res.status(501).json({ error: err });
    } else {
      res.json({
        originalname: req.file.originalname,
        uploadname: req.file.filename,
      });
    }
  });
});

//authorize user
router.post("/authorize", async (req, res) => {
  console.log("Req data is ...", req.body);
  const result = await dbService.authorizeUser(req.body);
  if (result === 200) res.status(200).send("Authorization success");
  else res.status(200).send("Failed");
});

module.exports = router;
