const express = require("express");
const router = express.Router();

const checkoutController = require("../controllers/checkoutController");

router.get("/",checkoutController.home)
router.post("/paid", checkoutController.paid);
router.post("/checkout", checkoutController.checkout)

//API
const API = '/api'
router.post(`${API}/checkout` , checkoutController.apiCheckout)

module.exports = router;
