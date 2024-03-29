const express = require("express");
const sanitize = require("mongo-sanitize");
const { bcryptCompare, validateUsername } = require("../public/js/utils");
const { validatePassword } = require("../public/js/utils");

const router = express.Router();

const User = require("./../models/user");

const title = "login";

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.use("./public/js/utils", bcryptCompare);
router.use("./public/js/utils", validateUsername);
router.use("./public/js/utils", validatePassword);

router.use(function (req, res, next) {
  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  next();
});

router.get("/", (req, res) => {
  if (req.session.authenticated) res.redirect("/home");
  else res.render("login/login", { title: title });
});

router.post("/", async (req, res) => {
  const { username, password } = req.body.data;

  try {
    
    if (username.length < 4) 
      throw new Error("Invalid username");
    if (password.length < 8)
      throw new Error("Invalid password");

    const user = await User.findOne({ username: username });

    if (username && password) {
      if (req.session.authenticated) {
        res.json(req.session);
      } else {
        if (user) {
          const valid = await bcryptCompare(password, user);
          const username = user.username;

          if (valid) {
          
            req.session.authenticated = true;
            req.session.user = {
              username,
            };

            res.status(200).json(req.session);
          } else throw new Error("Wrong password");
        } else {
          throw new Error("User not found");
        }
      }
    } else {
      throw new Error("Missing parameters");
    }
  } catch (e) {
    console.log(e.message);
    if (
      e.message.includes("Wrong") ||
      e.message.includes("User not found") ||
      e.message.includes("undefined") ||
      e.message.includes("Invalid")
    ) {
      res.status(403).json({
        msg: "The username or password is incorrect.",
      });
    } else {
      res.status(500).json({
        msg: "There was a problem processing your request",
      });
    }
    console.log(e.message);
  }
});

module.exports = router;
