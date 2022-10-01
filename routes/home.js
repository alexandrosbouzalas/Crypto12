const express = require("express");
const axios = require("axios");
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

router.get("/fetchCData", (req, res) => {
  const baseUrl = "https://api-pub.bitfinex.com/v2/tickers";

  const queryParams = "symbols=tBTCUSD,tETHUSD,tSHIB:USD,tDOGE:USD,tMATIC:USD,tLTCUSD,tXMRUSD,tADAUSD,tDOTUSD,tSOLUSD"

  const KEYS = ['FRR', 'BID', 'BID_PERIOD', 'BID_SIZE', 'ASK', 'ASK_PERIOD', 'ASK_SIZE', 'DAILY_CHANGE', 'DAILY_CHANGE_RELATIVE', 'LAST_PRICE'];
  const JSONCData = {};

  axios.get(`${baseUrl}?${queryParams}`)
    .then(response => {

      for (let coin of response.data) {
        JSONCData[coin[0]] = {};
        KEYS.forEach((coinattr, i) => {
          JSONCData[coin[0]][KEYS[i]] = coin[i + 1];
        })
      }

      res.send(JSONCData);
    }, error => {
        res.send(error)
        console.log(error); 
    })
    
})

module.exports = router;
