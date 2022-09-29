const express = require("express");
const router = express.Router();

router.use(express.json());

const User = require("./../models/user");
const Order = require("./../models/order");

router.get("/", (req, res) => {
  if (req.session.authenticated) {
    res.render("home/home");
  } else {
    res.redirect("/");
  } 
});

module.exports = router;
