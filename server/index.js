require("dotenv").config();
const express = require("express");
const cors = require("cors");
const userRoutes = require("./app/routes/userRoutes");
const temperatureRoutes = require("./app/routes/temperatureRoutes");
const generalDataRoutes = require("./app/routes/generalDataRoutes");
const emailRoutes = require("./app/routes/emailRoutes");
const mapRoutes = require("./app/routes/mapRoutes");
const poiRoutes = require("./app/routes/poisRoutes");
const tempByCoordinatesRoutes = require("./app/routes/tempByCoordinatesRoutes");
const mapVisualsRoutes = require("./app/routes/mapVisualsRoutes")

const PORT = process.env.PORT || 8080;
let corsOptions = {
   origin : ['https://term-group-project-c01s25-project-t.vercel.app','http://localhost:3000'],
   credentials: true
}

const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/temperatures", temperatureRoutes);
app.use("/api/general-data", generalDataRoutes);
app.use("/api/notify-all", emailRoutes);
app.use("/api/map", mapRoutes);
app.use("/api/poi", poiRoutes);
app.use("/api/tempByCoordinates", tempByCoordinatesRoutes);
app.use("/api/map-visual", mapVisualsRoutes)

app.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
});
