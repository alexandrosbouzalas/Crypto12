const express = require("express");
const axios = require("axios");
const router = express.Router();

router.use(express.json());

const User = require("./../models/user");
const Order = require("./../models/order");
const { request, response } = require("express");

getCurrencyRates = async () => {

  return await axios.get('https://open.er-api.com/v6/latest/USD')
    .then(response => {
        const rates = response.data.rates;

        return {JPY: rates.JPY, EUR: rates.EUR}
    }, error => {
        console.log(error);
        res.status(500).send(error);
      })

}

fetchCData = async () => {

  const baseUrl = "https://api-pub.bitfinex.com/v2/tickers";

  const queryParams = "symbols=tBTCUSD,tETHUSD,tSHIB:USD,tDOGE:USD,tMATIC:USD,tLTCUSD,tXMRUSD,tADAUSD,tDOTUSD,tSOLUSD"

  const KEYS = ['FRR', 'BID', 'BID_PERIOD', 'BID_SIZE', 'ASK', 'ASK_PERIOD', 'ASK_SIZE', 'DAILY_CHANGE', 'DAILY_CHANGE_RELATIVE', 'LAST_PRICE'];
  const JSONCData = {};

  return await axios.get(`${baseUrl}?${queryParams}`)
    .then(response => {
      for (let coin of response.data) {
        JSONCData[coin[0]] = {};
        KEYS.forEach((coinattr, i) => {
          JSONCData[coin[0]][KEYS[i]] = coin[i + 1];
        })
      }
      
      return JSONCData;

    }, error => {
        res.status(503).send(error);
        console.log(error);
    })
}

router.get("/", (req, res) => {
  if (req.session.authenticated) {
    res.render("home/home");
  } else {
    res.redirect("/");
  } 
});

router.get("/fetchCData", async (req, res) => {
  fetchCData().then(data => {
    res.status(200).send(data)
  }).catch(err => {
    res.status(500).send();
  })
})

/* router.post("/fetchCDataHistory", (req, res) => {

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
}) */

router.get('/getCurrencyRates', async (req, res)  => {
  getCurrencyRates().then(data => {
    res.status(200).send(data)
  }).catch(err => {
    res.status(500).send();
  })
})


router.post('/placeOrder', async (req, res) => {
  if(req.session.authenticated) {

    const coins = ['BTC', 'ETH', 'SHIB', 'DOGE', 'MATIC', 'LTC', 'XMR', 'ADA', 'DOT', 'SOL'];
  
    const currencies = ['USD', 'EUR', 'JPY'];
  
    const {coin, price, amount, currency} = req.body.data;
  
    if(!currencies.includes(currency))
      res.status(400).send('Invalid currency');
      
    if(!coins.includes(coin))
      res.status(400).send('Invalid coin');
    
    if(price > 999999 || price.length === 0)
      res.status(400).send('Invalid purchase price');
  
    if(price.length >  0 && /[^0-9.]$/.test(price))
      res.status(400).send('Invalid purchase price');
  
    if(price[0] === '.')
        price = '0' + price;
    if(price[price.length - 1] === '.')
        price = price + '0';
    
    try {
      
      const user = await User.findOne({username: req.session.user.username});

      const orders = await Order.find({});

      if(user) {

        const order = new Order({
          uId: user.uId,
          oId: orders.length + 1 || 1,
          cId: coin,
          cAmount: amount,
          oCurrency: currency,
          placedAt: new Date()
        })

        try {
          await order.save();
        } catch(err) {
          console.log(err);
          throw new Error("Order could not be saved")
        }
        res.status(200).send();

      } else {
        console.log("User not found");
        res.status(403).send("User not found");
      }
    } catch(err) {

      console.log(err);
      res.status(500).send();
    }
  
  } else {
    res.status(403).send();    
  }

})

router.get('/getUserOrders', async (req, res) => {
  if(req.session.authenticated) {

    const user = await User.findOne({userId: req.session.user.username});

    if(user) {

      const userOrders = await Order.find({userId: user.userId});

      if(userOrders) {
        res.status(200).send(userOrders);
      } else {
        res.status(200).send("This user has not placed any orders");
      }

    } else {
      res.status(403).send("User not found");
    }

  }
})

router.get('/getUserCryptoData', async (req, res) => {
  if(req.session.authenticated) {

    try {

      const user = await User.findOne({username: req.session.user.username});
  
      if(user) {
        
        const distinctCoinAmountSum = await Order.aggregate([
          {
            $match: {
              uId: user.uId
            }
          },
          {
            $group: {
              _id: "$cId",
              cAmount: {
                $sum: "$cAmount"
              },
              count: {
                $sum: 1
              }
            }
          }
        ])
  
        if(distinctCoinAmountSum.length > 0)
          res.status(200).send(distinctCoinAmountSum);
        else 
          res.status(200).send("No data found for this user");
      }
    } catch(err) {
      res.status(500).send(err);
    }
  }
})

module.exports = router;
