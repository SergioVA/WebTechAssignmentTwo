var express = require('express');
var exphbs  = require('express-handlebars');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var mongodb = require('mongodb');
var app = express();
var MongoClient = mongodb.MongoClient;

var uri = 'mongodb://todolistapp:todoappjs@ds054619.mlab.com:54619/todolist';
var db;

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true })); //used for bootstrap login and sign up forms
app.use(expressSession({secret: '1234567890QWERTY', saveUninitialized: false, resave: false}));
//make sure that the session variable is available for handlebars
app.use(function(req, res, next){
        res.locals.session = req.session;
        next();
});

// views is directory for all template files
// app.set('views', __dirname + '/views');
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//db.users.createIndex({"email":1}, {unique:true});

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/login', function(req, res) {
  console.log('Current session email:' + req.session.user);

  //if the user is already logged in
  if(req.session.user) {
    //res.send('Already logged in');
    res.redirect('/profile');
    return;
  }
  else {
    res.render('pages/login');
  }
});

app.post('/login', function(req, res, next) {
  console.log('received login request');

  //if the user is already logged in
  if(req.session.user) {
    //res.send('Already logged in');
    res.redirect('/profile');
    return;
  }

  var email = req.body.email;
  var password = req.body.password;

  var users = db.collection('users');
  users.findOne({ email: email }, function(err, user) {
    if(err) return next(err);
    if(user) {
      if(user.password === password) {

        req.session.user = email;
        res.redirect('/profile');
      }
      else {
        console.log('user pw is ' + user + ' but pw input was ' + password);
        res.send('Wrong password');
      }
    }
    else
      res.send('Wrong email!');
  });
});

app.get('/signup', function(request, response) {
  response.render('pages/signup');
});

app.post('/signup', function(request, response) {
  console.log('Received new account post info');

  registerAccount(request.body.email, request.body.password);
  //response.redirect('/profile');
  response.redirect('/login');
});

app.get('/profile', isLoggedIn, function(request, response) {
  console.log('received login request');
  //response.send('Login response for ' + request.session.user);
  //var todolist = [{text: 'test', done: false}, {text: 'doneTesting', done: true}]
  var todolist = getTodoList(request.session.user);
  console.log('Get todo list: ' + JSON.stringify(todolist));
  response.render('pages/profile', {listitems: todolist});
});

app.post('/profile', function(req, res) {
  console.log('Received profile post request with item' + req.body);

  addTodoItem(req.session.user, req.body.text, req.body.done);

  res.render('pages/profile');
});

app.delete('/profile', function(req, res) {
  console.log('Received profile delete request with item' + JSON.stringify(req.body));

  res.render('pages/profile');
});

app.get('/logout', function (req, res) {
   req.session.user = null;
   res.send('User logged out');
});

MongoClient.connect(uri, function(err, database) {
  if(err) {
    console.log('could not connect to database');
    throw err;
  }
  else {
    db = database;
    app.listen(app.get('port'), function() {
      console.log('Node app is running on port', app.get('port'));
    });
  }
});

function registerAccount(email, password) {
  console.log('Received login request with email: ' + email + ' and password:' + password);
  var accountData = [
    {
      email:email,
      password:password
    }
  ];

  var users = db.collection('users');
  users.insert(accountData, function(err, result) {
    if(err)
      throw err;
    else
      console.log('Added user');
  });
}

function createAccountObj(email, password) {
  return [
    {
      email:email,
      password:password
    }
  ];
}

//insert or update items
function addTodoItem(owneremail, text, isDone) {
  console.log('Adding new todo item with owner: ' + owneremail + ' ,text: ' + text + ' ,done: ' + isDone);
  var todoitems = db.collection('todoitems');
  var query = {owner: owneremail, text: text};
  var updateParams = { $set: {done: isDone}};
  todoitems.update(query, updateParams, {upsert: true}, function(err, doc) {
    if(err) throw err;
  });
}

function getTodoList(owneremail) {
  var todoitems = db.collection('todoitems');
  todoitems.find({ owner: owneremail }, function(err, todolist) {
    if(err) throw err;

    if(todolist) {
      console.log('got a todolist' + todolist);
      return todolist.toArray();
    }
    else {
      console.log('could not find user with email ' + owneremail);
      return [];
    }

  });
}

function isLoggedIn(req, res, next) {
  //if user is authenticated in the session, carry on
  if(req.session.user)
    return next();

  //if user is not authenticated, redirect to login page
  res.redirect('/login');
}
