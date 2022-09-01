var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/product', function(req, res, next) {
  console.log('test')
  if(req.session.dataCardBike == undefined){
    req.session.dataCardBike = []
  }

  console.log(req.session.dataCardBike)
  res.render('product', {title: "product", tabbike });
});

router.get('/shop.ejs', function(req, res, next) {
  var alreadyExist = false ;
let fees 
  for ( let i = 0 ; i<req.session.dataCardBike.length ; i++) {
    if (req.session.dataCardBike[i].model == req.query.model) {
      req.session.dataCardBike[i].quantité = Number(req.session.dataCardBike[i].quantité) + 1
    
      alreadyExist = true;
    } }
  if(alreadyExist == false){
      req.session.dataCardBike.push(req.query)
     } 
  console.log(req.session.dataCardBike)
  res.render('shop', {dataCardBike : req.session.dataCardBike});
});

router.get('/delete-shop', function(req, res, next) {
  req.session.dataCardBike.splice(req.query.position-1,1)
  res.render('shop', {dataCardBike : req.session.dataCardBike});
});

router.post('/update-shop', function(req, res, next) {
  console.log(req.body)
  req.session.dataCardBike[req.body.button].quantité= req.body.quantity
  res.render('shop', {dataCardBike : req.session.dataCardBike});
});


 // gestion de stripe et des différents frais de ports
router.post('/create-checkout-session', async (req, res) => {
  let stripe_card_items =[]
  let session;
 for (let i = 0 ; i < req.session.dataCardBike.length ; i++) {
  let article ={
    price_data : {
        currency : 'eur',
        product_data: { 
            name :  req.session.dataCardBike[i].model,
        },
        unit_amount : req.session.dataCardBike[i].prix*100,
        },
    quantity : req.session.dataCardBike[i].quantité,
   }
  stripe_card_items.push(article)
 }

 var total = 0
 for (let j=0 ; j<stripe_card_items.length ; j++) {
  total += stripe_card_items[j].price_data.unit_amount*stripe_card_items[j].quantity
 }
  session = await stripe.checkout.sessions.create({

   payment_method_types: ['card'],
   
   shipping_options: [
    {
      shipping_rate_data: {
        type: 'fixed_amount',
        fixed_amount: {
          amount: total < 200000 ? 3000 : (total < 400000 ? 1500 : 0),
          currency: 'eur',
        },
        display_name: 'livraison standard',
        // Delivers between 5-7 business days
        delivery_estimate: {
          minimum: {
            unit: 'business_day',
            value: 5,
          },
          maximum: {
            unit: 'business_day',
            value: 7,
          },
        }
      }
    },
    {
      shipping_rate_data: {
        type: 'fixed_amount',
        fixed_amount: {
          amount: total < 200000 ? 13000 : (total < 400000 ? 11500 : 10000),
          currency: 'eur',
        },
        display_name: 'livraison express',
        // Delivers between 5-7 business days
        delivery_estimate: {
          minimum: {
            unit: 'business_day',
            value: 5,
          },
          maximum: {
            unit: 'business_day',
            value: 7,
          },
        }
      }
    },
    {
      shipping_rate_data: {
        type: 'fixed_amount',
        fixed_amount: {
          amount: 5000 + 2000*stripe_card_items.length,
          currency: 'eur',
        },
        display_name: 'livraison en point relais',
        // Delivers between 5-7 business days
        delivery_estimate: {
          minimum: {
            unit: 'business_day',
            value: 1,
          },
          maximum: {
            unit: 'business_day',
            value: 2,
          },
        }
      }
    },
  ],
   line_items : stripe_card_items,
   mode : 'payment',
   success_url: 'http://localhost:3000/success',
   cancel_url: 'http://localhost:3000/cancel',
 }) 


 res.redirect(303, session.url);
});

router.get('/success', (req, res) => {
  res.render('success');
 });

 router.get('/cancel', (req, res) => {
  res.render('cancel');
 });

module.exports = router;   
