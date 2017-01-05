var express = require('express');
var cool = require('cool-ascii-faces');
var bodyParser = require('body-parser');
var app = express();
var pg = require('pg');

pg.defaults.ssl = true;

/*
pg.connect(process.env.DATABASE_URL, function(err, client) {
  if(err) throw err;

  console.log('Connected to postgress! Getting schemas..');

  client.query('SELECT table_schema,table_name FROM information_schema.tables').on('row', function(row) {
    console.log(JSON.stringify(row));
  });
});
*/

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true })); //used for bootstrap login and sign up forms

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/cool', function(request, response) {
  response.send(cool());
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
