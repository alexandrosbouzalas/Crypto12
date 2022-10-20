const express = require("express");
const axios = require("axios");
const router = express.Router();

router.use(express.json());

const User = require("./../models/user");
const Order = require("./../models/order");
const { Router, response } = require("express");

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
        res.status(503).send(error);
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

router.get('/getCurrencyRates', (req, res)  => {

  axios.get('https://open.er-api.com/v6/latest/USD')
    .then(response => {
        const rates = response.data.rates;

        res.send({JPY: rates.JPY, EUR: rates.EUR})
    }, error => {
        console.log(error);
        res.status(500).send(error);
      })

})


router.post('/placeOrder', (req, res) => {

  const {coin, price, currency} = req.body.data;

  if(price > 9999999 || price.length === 0)
    res.status(400).send('Invalid purchase price');

  if(price.length >  0 && /[^0-9.]$/.test(price))
    res.status(400).send('Invalid purchase price');


  if(price[0] === '.')
      price = '0' + price;
  if(price[price.length - 1] === '.')
      price = price + '0';

  console.log(coin, parseFloat(price), currency)

  res.status(200).send('SUCCESS');

})

module.exports = router;
