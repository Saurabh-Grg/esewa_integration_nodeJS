// routes/esewaRoutes
const express = require("express");
const router = express.Router();
const esewaController = require("../controllers/esewaController");

router.post("/initialize-esewa", esewaController.initializePayment);
router.get("/complete-payment", esewaController.completePayment);

module.exports = router;
