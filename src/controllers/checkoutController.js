const request = require('request');
const express = require("express");
const router = express.Router();
const keys = require("../data/keys");
const order = require("../data/order")
const hmacSHA256 = require('crypto-js/hmac-sha256')
const Hex = require('crypto-js/enc-hex')
const controller = {};

const endpoint = keys.endpoint         // SERVIDOR
const username = keys.username;        // USUARIO
const password = keys.password         // CONTRASEÑA API REST
const publickey = keys.publickey       // PUBLIC KEY


//SE GENERA EL TOKEN DE AUTENTICACIÓN ==============================================//
const auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');    // AUTENTICACION


controller.home = (req, res) => {
  res.render("home")
}

controller.checkout = (req, res,next) => {
  request.post({
    url: `${endpoint}/api-payment/V4/Charge/CreatePayment`,
    headers: {
      'Authorization': auth,
      'Content-Type': 'application/json'
    },
    json: order
  }, 
  function(error, response, body) {
    if (body.status === 'SUCCESS')
    {
      // Send back the form token to the client side
      const formtoken = body.answer.formToken;
      res.render("checkout",
      {formtoken ,publickey , endpoint}
    );
    }
    else
    {
      console.error(body);
      res.status(500).send('error');
    }  
  })
};

controller.paid =  (req,res)=> {
  console.log(req.body);
  const answer = req.body.clientAnswer
  const hash = req.body.hash
  const reAnswerHash = Hex.stringify(
    hmacSHA256(JSON.stringify(hash), keys.HMACSHA256)
  )
  const answerHash = Hex.stringify(
    hmacSHA256(JSON.stringify(answer), keys.HMACSHA256)
  )
  
  if (reAnswerHash === answerHash)
   res.status(200).render('paid', {'response' : 'Pago exitoso'} )
  else res.status(500).render('paid', {'response' : 'Error catastrófico'})
}

//API ========================================================================//

controller.apiCheckout = (req,res,next) => {
  request.post({
    url: `${endpoint}/api-payment/V4/Charge/CreatePayment`,
    headers: {
      'Authorization': auth,
      'Content-Type': 'application/json'
    },
    json: order
  }, 
  function(error, response, body) {
    if (body.status === 'SUCCESS')
    {
      const formtoken = body.answer.formToken;
      res.send({formtoken , publickey , endpoint})
    }
    else
    {
      console.error(body);
      res.status(500).send('error');
    }  
  })
};

controller.apiValidate = (req,res,next) => {

  const answer = req.body.clientAnswer
  const hash = req.body.hash
  const reAnswerHash = Hex.stringify(
    hmacSHA256(JSON.stringify(hash), keys.HMACSHA256)
  )
  const answerHash = Hex.stringify(
    hmacSHA256(JSON.stringify(answer), keys.HMACSHA256)
  )
  
  if (reAnswerHash === answerHash)
   res.status(200).send( {'response' : 'Pago exitoso'} )
  else res.status(500).send( {'response' : 'Error catastrófico'})
}


module.exports = controller;
