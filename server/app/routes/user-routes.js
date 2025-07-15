const userController = require("../controllers/user-controller");
const { Router } = require("express");
const { authenticateUser } = require("../middleware/authUser");

const userRouter = Router();

userRouter.use(authenticateUser);
userRouter.get("/", userController.getUsers);

module.exports = userRouter;
