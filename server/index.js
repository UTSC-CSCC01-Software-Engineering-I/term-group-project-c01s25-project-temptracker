require("dotenv").config();
const express = require("express");
const cors = require("cors");
const userRoutes = require("./app/routes/userRoutes");
const temperatureRoutes = require("./app/routes/temperatureRoutes");
const generalDataRoutes = require("./app/routes/generalDataRoutes");
const emailRoutes = require("./app/routes/emailRoutes");

const PORT = process.env.PORT || 8080;

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/temperatures", temperatureRoutes);
app.use("/api/general-data", generalDataRoutes);
app.use("/api/notify-all", emailRoutes);

app.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
});
