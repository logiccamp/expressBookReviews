const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
var bodyParser = require('body-parser')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const ENV = require('./config');

const app = express();
app.use(bodyParser.urlencoded({extended : true}))
app.use(bodyParser.json({extended : true}))
app.use(bodyParser.raw())


app.use("/customer",session({secret: ENV.JWT_SECRET,resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth (req,res,next){
     // access authorize header to validate request
     const token = req.session.token
     if(!token){
        return res.status(401).json({message : "Unauthenticated"});
     }
     // retrive the user details fo the logged in user
     const decodedToken = jwt.verify(token, ENV.JWT_SECRET);

     if(!decodedToken){
        return res.json({status : false, message : "Invalid bearer token"});
     }
     req.user = decodedToken;

     next()
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
