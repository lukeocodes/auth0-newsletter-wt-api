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
    code: 'subscribed',
    message: 'You have successfully subscribed to the newsletter!'
  },
  UNSUBSCRIBED : {
    statusCode : 200,
    code: 'unsubscribed',
    message: 'You have successfully unsubscribed from the newsletter!'
  },
  DUPLICATE : {
    statusCode : 400,
    message : 'You are already subscribed.'
  },
  ERROR : {
    statusCode : 400,
    message: 'Something went wrong. Please try again.'
  },
  UNAUTHORIZED : {
    statusCode : 401,
    message : 'You must be logged in to access this resource.'
  }
};

const app = new express();

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

const userProfile = (req) => {
  const userinfo = `https://${req.webtaskContext.secrets.AUTH0_DOMAIN}/userinfo`
  return axios.get(userinfo, { headers: { Authorization: req.headers.authorization }})
    .then(response => {
      return response.data;
    })
    .catch(console.error);
};

// const sendResponse = (key, res) => {
//   res.setHeader('Content-Type', 'application/json');
//   res.statusCode = RESPONSE[key].statusCode;
//   res.end(JSON.stringify(RESPONSE[key]));
// }

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
  userProfile(req)
    .then(result => {
      const email = result.email;

      if ( email ) {
        req.webtaskContext.storage.get((err, data) => {
          if(err){
            console.log(err);
            res.writeHead(RESPONSE.ERROR.statusCode, { 'Content-Type': 'application/json'});
            res.end(JSON.stringify(RESPONSE.ERROR));
          }

          data = data || [];

          if(_.indexOf(data, email) == -1){
            res.writeHead(RESPONSE.UNSUBSCRIBED.statusCode, { 'Content-Type': 'application/json'});
            res.end(JSON.stringify(RESPONSE.UNSUBSCRIBED));
          } else {
            res.writeHead(RESPONSE.OK.statusCode, { 'Content-Type': 'application/json'});
            res.end(JSON.stringify(RESPONSE.OK));
          }
        })
      } else {
        console.log('no email');
        res.writeHead(RESPONSE.ERROR.statusCode, { 'Content-Type': 'application/json'});
        res.end(JSON.stringify(RESPONSE.ERROR));
      }
    })
    .catch(err => {
      console.log(err);
      res.writeHead(RESPONSE.ERROR.statusCode, { 'Content-Type': 'application/json'});
      res.end(JSON.stringify(RESPONSE.ERROR));
    })
})

module.exports = Webtask.fromExpress(app);