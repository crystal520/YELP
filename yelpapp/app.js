// Module Dependencies and Setup

var express = require('express')
  , mongoose = require('mongoose')
  , CheckinModel = require('./models/checkin')
  , welcome = require('./controllers/welcome')
  , analysis = require('./controllers/analysis')
  , http = require('http')
  , flash = require('connect-flash')
  , path = require('path')
  , fs = require('fs')
  , engine = require('ejs-locals')
  , config = require('./config')
  , app = express();

app.engine('ejs', engine);
app.set('port', 80);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.logger('dev'));




// Helpers

app.use(function(req, res, next){
  app.locals.layoutPath = "../shared/layout";
  next();
});

app.configure(function() {
  app.use(express.cookieParser('keyboard cat'));
  app.use(express.session({ cookie: { maxAge: 60000 }}));
  app.use(flash());
});

// Routing Initializers

app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

// Error Handling

if ('development' == app.get('env')) {
  app.use(express.errorHandler());
} else {
  app.use(function(err, req, res, next) {
    res.render('errors/500', { status: 500 });
  });
}

// Database Connection




// Routing


//User route
app.get('/', welcome.index);



// // prize status

// app.get('/reset', status.reset);
// app.get('/initial', status.initial);


// // prize status

app.get('/analysis/:id?', analysis.analysis);
app.get('/review/:id?', analysis.review);
app.get('/map', analysis.map);

// app.get('/update/:itemName?', status.update);



app.all('*', welcome.not_found);

// Start Server w/ DB Connection



var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/yelp');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  // yay!
  console.log("yay!");
  http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
  });

});


