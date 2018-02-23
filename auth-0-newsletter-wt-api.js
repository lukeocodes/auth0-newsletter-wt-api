'use latest';
import bodyParser from 'body-parser';
import express from 'express';
import Webtask from 'webtask-tools';
import _ from 'lodash';

const app = new express();
app.use(bodyParser.json());

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

app.post('/subscribe', function(req, res){
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
  console.log('here', req.user);
  res.writeHead(200, { 'Content-Type': 'application/json'});
  res.end(JSON.stringify(RESPONSE.ERROR));
})

app.post('/unsubscribe', function(req, res){
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
  console.log('here', req.user);
  res.writeHead(200, { 'Content-Type': 'application/json'});
  res.end(JSON.stringify(RESPONSE.ERROR));
})

app.get('/subscribed', function(req, res){
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
  console.log('here', req.user);
  res.writeHead(200, { 'Content-Type': 'application/json'});
  res.end(JSON.stringify(RESPONSE.ERROR));
})

module.exports = Webtask.fromExpress(app).auth0({
  loginError: function (error, ctx, req, res, baseUrl) {
    res.writeHead(401, { 'Content-Type': 'application/json'})
    res.end(JSON.stringify(RESPONSE.UNAUTHORIZED))
  }
});