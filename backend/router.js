const express = require("express");
const controller = require("./controller");

const router = express.Router();

// routes
router.get("/dns/reverse", controller.dns_reverse);

module.exports = router;
