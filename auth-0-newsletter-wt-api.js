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
    status: 'subscribed',
    message: 'You have successfully subscribed to the newsletter!'
  },
  UNSUBSCRIBED : {
    statusCode : 200,
    status: 'unsubscribed',
    message: 'You have successfully unsubscribed from the newsletter!'
  },
  DUPLICATE : {
    statusCode : 400,
    status: 'duplicate',
    message : 'You are already subscribed.'
  },
  ERROR : {
    statusCode : 400,
    status: 'error',
    message: 'Something went wrong. Please try again.'
  },
  UNAUTHORIZED : {
    statusCode : 401,
    status: 'unauthorized',
    message : 'You must be logged in to access this resource.'
  }
};

const app = new express();

app.use(bodyParser.json());

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

const sendResponse = (key, res) => {
  res.status(RESPONSE[key].statusCode).send(RESPONSE[key]);
}

app.get('/subscribe', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json'});
  res.end(JSON.stringify(RESPONSE.OK));
})

app.get('/unsubscribe', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json'});
  res.end(JSON.stringify(RESPONSE.OK));
})

app.get('/subscribed', (req, res) => {
  userProfile(req)
    .then(result => {
      const email = result.email;

      if ( email ) {
        req.webtaskContext.storage.get((err, data) => {
          let responseKey = 'ERROR';

          if(err){
            console.log(err);
            responseKey = 'ERROR';
          }

          data = data || [];

          if(_.indexOf(data, email) == -1){
            responseKey = 'UNSUBSCRIBED';
          } else {
            responseKey = 'OK';
          }
    console.log('here 2');

          sendResponse(responseKey, res);
        })
      } else {
        console.log('no email');
        sendResponse('ERROR', res);
      }
    })
    .catch(err => {
    console.log('here error');
      console.log(err);
      sendResponse('ERROR', res);
    })
    
    console.log('here 1');
})

module.exports = Webtask.fromExpress(app);