const express = require("express");
const router = express.Router();
const dbService = require("../services/dbService");

router.get("/", (req, res) => {
  res.status(200).send("Solutions route is running...");
});

router.post("/get", async (req, res) => {
  const result = await dbService.getAllSolutions();
  res.status(200).send(result);
});

module.exports = router;
