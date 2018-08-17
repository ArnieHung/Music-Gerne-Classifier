var express = require('express')
var app = express()

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
  
  
app.use(express.static('public'));

app.listen(3000, ()=>{
  console.log("listeing pn port 3000");
});