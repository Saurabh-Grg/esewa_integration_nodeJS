const express = require("express");
const bodyParser = require("body-parser");
const esewaRoutes = require("./routes/esewaRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Use eSewa routes
app.use("/", esewaRoutes);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/test.html");
});

app.listen(PORT, () => {
  console.log(`Backend listening at http://localhost:${PORT}`);
});
