const express = require("express");
const cors = require("cors");
require("dotenv").config();

const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express());

app.get("/", async (req, res) => {
  res.send("Server is Running");
});

app.listen(port, () => {
  console.log(`Purana Phone is running on port: ${port}`);
});
