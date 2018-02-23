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
          let responseKey = 'ERROR';

          if ( err ) {
console.log('error 1');
            responseKey = 'ERROR';
          }

          data = data || [];

          if ( _.indexOf(data, email) == -1 ) {
            data.push(email);
            req.webtaskContext.storage.set(data, function (err) {
              console.log(err);
              if ( err ) {
console.log('error 2');
                responseKey = 'ERROR';
              } else {
                responseKey = 'OK';
              }
            })
          } else {
            responseKey = 'DUPLICATE';
          }

          sendResponse(responseKey, res);
        })
      } else {
console.log('error 3');
        sendResponse('ERROR', res);
      }
    })
    .catch(err => {
console.log('error 4');
      sendResponse('ERROR', res);
    });
});

app.get('/unsubscribe', (req, res) => {
  userProfile(req)
    .then(result => {
      const email = result.email;

      if ( email ) {
        req.webtaskContext.storage.get((err, data) => {
          let responseKey = 'ERROR';

          if ( err ) {
console.log('error 1');
            responseKey = 'ERROR';
          }

          data = data || [];
          
          const index = _.indexOf(data, email);

          if ( index == -1 ) {
console.log('error 2');
            responseKey = 'ERROR';
          } else {
            data.splice(index, 1);
            req.webtaskContext.storage.set(data, function (err) {
              console.log(err);
              if ( err ) {
console.log('error 3');
                responseKey = 'ERROR';
              } else {
                responseKey = 'UNSUBSCRIBED';
              }
            })
          }

          sendResponse(responseKey, res);
        })
      } else {
console.log('error 4');
        sendResponse('ERROR', res);
      }
    })
    .catch(err => {
console.log('error 5');
      sendResponse('ERROR', res);
    });
});


app.get('/subscribed', (req, res) => {
  userProfile(req)
    .then(result => {
      const email = result.email;

      if ( email ) {
        req.webtaskContext.storage.get((err, data) => {
          let responseKey = 'ERROR';

          if ( err ) {
            responseKey = 'ERROR';
          }

          data = data || [];

          if ( _.indexOf(data, email) == -1 ) {
            responseKey = 'UNSUBSCRIBED';
          } else {
            responseKey = 'OK';
          }

          sendResponse(responseKey, res);
        })
      } else {
        sendResponse('ERROR', res);
      }
    })
    .catch(console.error);
});

module.exports = Webtask.fromExpress(app);