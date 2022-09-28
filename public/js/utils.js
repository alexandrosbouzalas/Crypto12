const sjcl = require("sjcl");
const bcrypt = require("bcryptjs");

module.exports = {
  generateToken: function () {
    const seed = (Math.random() + 1).toString(36).substring(7);

    const bitArray = sjcl.hash.sha256.hash(seed);
    return sjcl.codec.hex.fromBits(bitArray);
  },

  bcryptHash: async function (password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  },

  bcryptCompare: async function (password, user) {
    return await bcrypt.compare(password, user.password);
  },

  validatePassword: function (password) {
    const rePassword =
      /^(?=(.*[a-z]){3,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){2,})(?=(.*[!@#$%^&*()\-__+.]){1,}).{8,}$/;

    if (password.toString().length < 8 || !rePassword.test(password))
      return false;
    else return true;
  },

  validateUsername: function (username) {
    const reUsername =
      /^[a-zA-Z0-9](_(?!(\.|_))|\.(?!(_|\.))|[a-zA-Z0-9]){2,18}[a-zA-Z0-9]$/;

    if (!reUsername.test(username)) return false;
    else return true;
  },
};
