const express = require("express");
const router = express.Router();

router.use(express.json());

router.get("/", (req, res) => {
  if (req.session.authenticated) {
    res.render("home/home");
  } else {
    res.redirect("/");
  } 
});

module.exports = router;
