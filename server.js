require("dotenv").config();
const express = require("express");
const cors = require("cors");
const users = require("./routes/users");
const solutions = require("./routes/solutions");
const dbService = require("./services/dbService");
const app = express();
app.use(express.json());

app.use(cors());

app.use("/user", users);
app.use("/solutions", solutions);

app.get("/", (req, res) => {
  res.send("Spreadsheet app - Backend is up and running...");
});

app.post("/ouList", async (req, res) => {
  const result = await dbService.getAllOu();
  res.status(200).send(result);
});

const port = process.env.PORT || 4200;
app.listen(port, () => {
  console.log("Backend is listening at port ", port);
});
