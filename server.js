require("dotenv").config();
const express = require("express");
const cors = require("cors");
const users = require("./routes/users");
const app = express();
app.use(express.json());

app.use(cors());

app.use("/user", users);

app.get("/", (req, res) => {
  res.send("Spreadsheet app - Backend is up and running...");
});

const port = process.env.PORT || 4200;
app.listen(port, () => {
  console.log("Backend is listening at port ", port);
});
