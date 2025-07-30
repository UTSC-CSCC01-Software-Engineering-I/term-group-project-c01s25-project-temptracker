const userController = require("../controllers/userController");
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
userRouter.get("/:id/stats", verifySelfAccess, userController.getUserStats);
userRouter.post("/:id/streak", verifySelfAccess, userController.updateUserStreak);
userRouter.post("/:id/submissions", verifySelfAccess, userController.updateUserSubmission);
userRouter.put("/:id/settings", verifySelfAccess, userController.updateUserSettings);

userRouter.get("/:id/badges", verifySelfAccess, userController.getUserBadges);
userRouter.post(
  "/:id/badges/award",
  verifySelfAccess,
  userController.awardUserBadges
);

module.exports = userRouter;
