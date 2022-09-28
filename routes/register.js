const express = require("express");
const sanitize = require("mongo-sanitize");
const { sendMail } = require("../public/js/mail");
const { generateToken } = require("../public/js/utils");
const { addTime } = require("../public/js/utils");
const { bcryptHash } = require("../public/js/utils");
const { validatePassword } = require("../public/js/utils");
const { validateEmail } = require("../public/js/utils");
const { validateUsername } = require("../public/js/utils");

// Database models
const User = require("./../models/user");
const Token = require("./../models/token");

const title = "register";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use("./public/js/utils", bcryptHash);
router.use("./public/js/utils", validatePassword);
router.use("./public/js/utils", validateUsername);

router.use(function (req, res, next) {
  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  next();
});

function createAccountToken(uId) {
  const token = new Token({
    token: generateToken(),
    for: "account",
    uId: uId,
    expirationDate: addTime(new Date(), 360),
  });

  return token;
}

router.get("/", (req, res) => {
  res.render("register/register", { title: title });
});

router.post("/", async (req, res) => {
  req.body = sanitize(req.body);

  const { username, password } = req.body.data;

  if (!validatePassword(password.toString()))
    throw new Error("Invalid password");
  if (!validateUsername(username.toString()))
    throw new Error("Invalid username");

  const usernameCount = await User.aggregate([{ $count: "username" }]);

  let count = 1;

  if (usernameCount.length != 0) count = usernameCount[0].username;

  const uId = Math.floor(count + Math.random() * 9000).toString();

  const user = new User({
    username: username,
    password: await bcryptHash(password),
    uId: uId,
  });

  try {
    await user.save();

    res.status(200).json({ msg: "Success" });
  } catch (e) {
    var status = res.status(500);
    if (e.message.includes("username"))
      status.json({
        msg: `Username "${username}" already exists`,
      });
    else
      status.json({ msg: "There was a problem processing your request" });

    console.log(e.message);
  }
});

module.exports = router;
