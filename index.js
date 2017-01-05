var express = require('express');
var exphbs  = require('express-handlebars');
var bodyParser = require('body-parser');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true })); //used for bootstrap login and sign up forms

// views is directory for all template files
// app.set('views', __dirname + '/views');
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/login', function(request, response) {
  response.render('pages/login');
});

app.get('/signup', function(request, response) {
  response.render('pages/signup');
});

app.post('/signup', function(request, response) {
  console.log('Received new account post info');

  login(request.body.email, request.body.password);
  //response.redirect('/profile');
  response.send('OK');
});

app.get('/profile', isLoggedIn, function(request, response) {
  console.log('received login request');
  response.send('Login response for ' + request.params.email);
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

function login(email, password) {
  console.log('Received login request with email: ' + email + ' and password:' + password);


}

function isLoggedIn(req, res, next) {
  //if user is authenticated in the session, carry on
  if(req.isAuthenticated())
    return next();

  //if user is not authenticated, redirect to home page
  res.redirect('/');
}
