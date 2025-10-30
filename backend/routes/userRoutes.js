const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/api/users", userController.getUsers);
router.get("/api/users/:id", userController.getUserById);
router.post("/api/users", userController.createUser);
router.put("/api/users/:id", userController.updateUser);
router.post("/api/users/:id/addxp", userController.addXp);
// router.delete("/api/users/:id", userController.deleteUser);

module.exports = router;
