const userController = require("../controllers/user-controller");
const { Router } = require("express");
const { authenticateUser } = require("../middleware/authUser");
const { requireAdmin } = require("../middleware/reqAdmin");
const { verifySelfAccess } = require("../middleware/verifySelf");

const userRouter = Router();

userRouter.use(authenticateUser);
userRouter.get("/", requireAdmin, userController.getUsers);
userRouter.get(
  "/:id/submissions",
  verifySelfAccess,
  userController.getUserSubmissions
);

module.exports = userRouter;
