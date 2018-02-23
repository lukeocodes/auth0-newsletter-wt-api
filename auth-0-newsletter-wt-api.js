'use latest';
import axios from 'axios';
import bodyParser from 'body-parser';
import express from 'express';
import Webtask from 'webtask-tools';
import jwt from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import _ from 'lodash';

const RESPONSE = {
  OK : {
    statusCode : 200,
    message: "You have successfully subscribed to the newsletter!",
  },
  DUPLICATE : {
    status : 400,
    message : "You are already subscribed."
  },
  ERROR : {
    statusCode : 400,
    message: "Something went wrong. Please try again."
  },
  UNAUTHORIZED : {
    statusCode : 401,
    message : "You must be logged in to access this resource."
  }
};

const app = new express();
let userProfile = {};

app.use((req, res, next) => { 
  const issuer = `https://${req.webtaskContext.secrets.AUTH0_DOMAIN}/`;
  jwt({
    secret: jwksRsa.expressJwtSecret({ jwksUri: `${issuer}.well-known/jwks.json` }),
    audience: req.webtaskContext.secrets.AUTH0_AUDIENCE,
    issuer: issuer,
    algorithms: [ 'RS256' ]
  })(req, res, next); 
  
  next();
});

app.use((req, res, next) => {
  axios.get(`https://${req.webtaskContext.secrets.AUTH0_DOMAIN}/userinfo`, { headers: { Authorization: req.headers.authorization }})
    .then(profileResponse => {
      console.log(profileResponse)
      userProfile = {
        user_id: profileResponse.data.sub,
        user_info: {
          name: profileResponse.data.nickname || profileResponse.data.name,
          picture: profileResponse.data.picture,
          maxScore: 0,
        }
      };
    })
    .catch(console.error);
    
  next();
});

app.use((req, res, next) => {
  console.log(userProfile);

  next();
});

app.use(bodyParser.json());

app.post('/subscribe', (req, res) => {
  // var email = req.body.email;
  // if(email){
  //   req.webtaskContext.storage.get(function(err, data){
  //     if(err){
  //       res.writeHead(400, { 'Content-Type': 'application/json'});
  //       res.end(JSON.stringify(RESPONSE.ERROR));
  //     }

  //     data = data || [];

  //     if(_.indexOf(data, email) == -1){
  //       data.push(email);
  //       req.webtaskContext.storage.set(data, function(err){
  //         if(err){
  //           res.writeHead(400, { 'Content-Type': 'application/json'});
  //           res.end(JSON.stringify(RESPONSE.ERROR));
  //         } else {
  //           res.writeHead(200, { 'Content-Type': 'application/json'});
  //           res.end(JSON.stringify(RESPONSE.OK));
  //         }
  //       })
  //     } else {
  //       res.writeHead(400, { 'Content-Type': 'application/json'});
  //       res.end(JSON.stringify(RESPONSE.DUPLICATE));
  //     }
  //   })
  // } else {
  //   res.writeHead(200, { 'Content-Type': 'application/json'});
  //   es.end(JSON.stringify(RESPONSE.ERROR));
  // }
  res.writeHead(200, { 'Content-Type': 'application/json'});
  res.end(JSON.stringify(RESPONSE.OK));
})

app.post('/unsubscribe', (req, res) => {
  // var email = req.body.email;
  // if(email){
  //   req.webtaskContext.storage.get(function(err, data){
  //     if(err){
  //       res.writeHead(400, { 'Content-Type': 'application/json'});
  //       res.end(JSON.stringify(RESPONSE.ERROR));
  //     }

  //     data = data || [];

  //     const index = _.indexOf(data, email);

  //     if(index == -1){
  //       res.writeHead(400, { 'Content-Type': 'application/json'});
  //       res.end(JSON.stringify(RESPONSE.ERROR));
  //     } else {
  //       data.splice(index, 1);
  //       req.webtaskContext.storage.set(data, function(err){
  //         if(err){
  //           res.writeHead(400, { 'Content-Type': 'application/json'});
  //           res.end(JSON.stringify(RESPONSE.ERROR));
  //         } else {
  //           res.writeHead(200, { 'Content-Type': 'application/json'});
  //           res.end(JSON.stringify(RESPONSE.OK));
  //         }
  //       })
  //     }
  //   })
  // } else {
  //   res.writeHead(200, { 'Content-Type': 'application/json'});
  //   res.end(JSON.stringify(RESPONSE.ERROR));
  // }
  res.writeHead(200, { 'Content-Type': 'application/json'});
  res.end(JSON.stringify(RESPONSE.OK));
})

app.get('/subscribed', (req, res) => {
  // const email = req.params.email;
  // if(email){
  //   req.webtaskContext.storage.get(function(err, data){
  //     if(err){
  //       res.writeHead(400, { 'Content-Type': 'application/json'});
  //       res.end(JSON.stringify(RESPONSE.ERROR));
  //     }

  //     data = data || [];

  //     if(_.indexOf(data, email) == -1){
  //       res.writeHead(200, { 'Content-Type': 'application/json'});
  //       res.end(JSON.stringify({subscribed: false}));
  //     } else {
  //       res.writeHead(200, { 'Content-Type': 'application/json'});
  //       res.end(JSON.stringify({subscribed: true}));
  //     }
  //   })
  // } else {
  //   res.writeHead(200, { 'Content-Type': 'application/json'});
  //   res.end(JSON.stringify(RESPONSE.ERROR));
  // }
  res.writeHead(200, { 'Content-Type': 'application/json'});
  res.end(JSON.stringify(RESPONSE.OK));
})

module.exports = Webtask.fromExpress(app);