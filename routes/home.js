const express = require("express");
const axios = require("axios");
const router = express.Router();

router.use(express.json());

const User = require("./../models/user");
const Order = require("./../models/order");
const { response } = require("express");

router.get("/", (req, res) => {
  if (req.session.authenticated) {
    res.render("home/home");
  } else {
    res.redirect("/");
  } 
});

router.post("/fetchCData", (req, res) => {
  const baseUrl = "https://api-pub.bitfinex.com/v2/tickers";

  const validCurrencies = ["USD", "EUR", "JPY"];

  if(!validCurrencies.includes(req.body.currency))
    res.status(404).send("Invalid currency");
  
  const currency = req.body.currency

  // const queryParams = `symbols=tBTC${currency},tETH${currency},tSHIB:${currency},tDOGE:${currency},tMATIC:${currency},tLTC${currency},tXMR${currency},tADA${currency},tDOT${currency},tSOL${currency}`
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

router.post("/fetchCDataHistory", (req, res) => {

  const oneWeekAgo = new Date(new Date().setDate(new Date().getDate() - 7)).setHours(0,0,0,0);

  const queryParams = ['tBTCUSD','tETHUSD','tSHIB:USD','tDOGE:USD','tMATIC:USD','tLTCUSD','tXMRUSD','tADAUSD','tDOTUSD','tSOLUSD'];

  if(!queryParams.includes(req.body.coin))
    res.status(404).send('Invalid query parameters');

  const JSONCHData = [];

  axios.get(`https://api-pub.bitfinex.com/v2/tickers/hist?symbols=${req.body.coin}&limit=250&start=${oneWeekAgo}`)
    .then(response => {
        for(let dataset of  response.data)
          JSONCHData.push(dataset.filter(n => n));
          res.send(JSONCHData);
    }, error => {
        console.log(error);
        res.status(500).send(error);
      })
})

module.exports = router;
