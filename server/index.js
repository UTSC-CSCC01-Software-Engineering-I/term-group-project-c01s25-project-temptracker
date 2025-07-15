require("dotenv").config();
const express = require("express");
const cors = require("cors");
const userRoutes = require("./app/routes/user-routes");
const temperatureRoutes = require("./app/routes/temperature-routes");

const PORT = process.env.PORT || 8080;

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/temperatures", temperatureRoutes);

app.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
});
