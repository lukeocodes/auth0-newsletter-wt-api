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
  }
};

const app = new express();

app.use(bodyParser.json());

app.use((req, res, next) => { 
  const issuer = `https://${req.webtaskContext.secrets.AUTH0_DOMAIN}/`;
  return jwt({
    secret: jwksRsa.expressJwtSecret({ jwksUri: `${issuer}.well-known/jwks.json` }),
    audience: req.webtaskContext.secrets.AUTH0_AUDIENCE,
    issuer: issuer,
    algorithms: [ 'RS256' ]
  })(req, res, next);
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
  userProfile(req)
    .then(result => {
      const email = result.email;

      if ( email ) {
        req.webtaskContext.storage.get((err, data) => {
          if ( err ) {
            sendResponse('ERROR', res);
          }

          data = data || [];

          if ( _.indexOf(data, email) == -1 ) {
            data.push(email);
            req.webtaskContext.storage.set(data, err => {
              if ( err === undefined ) {
                sendResponse('OK', res);
              } else {
                sendResponse('ERROR', res);
              }
            })
          } else {
            sendResponse('DUPLICATE', res);
          }
        })
      } else {
        sendResponse('ERROR', res);
      }
    })
    .catch(console.error);
});

app.get('/unsubscribe', (req, res) => {
  userProfile(req)
    .then(result => {
      const email = result.email;

      if ( email ) {
        req.webtaskContext.storage.get((err, data) => {
          if ( err ) {
            sendResponse('ERROR', res);
          }

          data = data || [];
          
          const index = _.indexOf(data, email);

          if ( index == -1 ) {
            sendResponse('ERROR', res);
          } else {
            data.splice(index, 1);
            req.webtaskContext.storage.set(data, err => {
              if ( err === undefined ) {
                sendResponse('UNSUBSCRIBED', res);
              } else {
                sendResponse('ERROR', res);
              }
            })
          }
        })
      } else {
        sendResponse('ERROR', res);
      }
    })
    .catch(console.error);
});

app.get('/subscribed', (req, res) => {
  userProfile(req)
    .then(result => {
      const email = result.email;

      if ( email ) {
        req.webtaskContext.storage.get((err, data) => {
          if ( err ) {
            sendResponse('ERROR', res);
          }

          data = data || [];

          if ( _.indexOf(data, email) == -1 ) {
            sendResponse('UNSUBSCRIBED', res);
          } else {
            sendResponse('OK', res);
          }
        })
      } else {
        sendResponse('ERROR', res);
      }
    })
    .catch(console.error);
});

module.exports = Webtask.fromExpress(app);