require("dotenv").config();
const express = require("express");
const cors = require("cors");
const userRoutes = require("./app/routes/user-routes");

const PORT = process.env.PORT || 8080;

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
});
