var express = require('express');
var router = express.Router();
var session = require('express-session');

router.get('/', function (req, res) {

  res.render('index');

});

router.use(session({
  saveUninitialized: false,
  resave: false,
  secret: 'doesnt-matter-because-its-a-prototype'
}));

/**
 * Middleware to handle the storage and retrieval of form values in session storage
 * Use case is to remember the state of a form element such as a checkbox across
 * page reloads
 */
router.use(function(req, res, next) {

  if(req.body.session) {
    for(var index in req.body.session) {
      if(req.body.session.hasOwnProperty(index)) {
        req.session[index] = req.body.session[index];
        console.log('Session based form value detected. Setting req.session[', index, '] as "', req.body.session[index], '"');
      }
    }
  }

  if(req.query.session) {
    for(var index in req.query.session) {
      if(req.query.session.hasOwnProperty(index)) {
        req.session[index] = req.query.session[index];
        console.log('Session based form value detected. Setting req.session[', index, '] as "', req.query.session[index], '"');
      }
    }
  }

  res.locals.session = req.session;

  next();
});


/**
 * Middleware to provide a "hack" which allows us to redirect the prototype
 * back to the appropriate page in our application. This allows multiple proto
 * variants to be created and for them to return to the correct place when
 * coming back from the verify prototype
 */
router.use(function(req, res, next) {

  // If we're on a page containing the verify button
  if(req.originalUrl.indexOf('sign-my-mortgage') !== -1) {

    // Store the current URL
    var url = req.protocol + "://" + req.get('host') + req.originalUrl;

    // Replace the last component of the path with the return page
    url = url.replace('sign-my-mortgage', 'how-to-proceed');

    // And bosh it in the session
    req.session['verify-return-url'] = url;
    console.log('Setting verify return URL to', url)


  // If we're returning from verify (to the current fixed URL)
  // And we've got a URL value in the session
  } else if (req.originalUrl.indexOf('service_vision/how-to-proceed') !== -1 && req.session['verify-return-url']) {

    // Grab the URL back out the session
    var return_url = req.session['verify-return-url'];

    // Clean up after ourselves
    delete req.session['verify-return-url'];

    // And issue the redirect
    console.log('Redirecting to', return_url);
    return res.redirect(return_url);
  }

  next();
});

// Route to display an error when invalid reference and/or dob entered
router.get('/:type(user_research|future_sprints|current_sprint)/how-to-proceed', function (req, res) {

  var dob_day = req.query.dob_day;
  var dob_month = req.query.dob_month;
  var dob_year = req.query.dob_year;

  if (dob_day == "00" && dob_month == "00" && dob_year == "0000"){

    url = '/' + req.params.type + '/incorrect-dob-format';
    res.redirect(url);

  } else if (dob_day == "31" && dob_month == "12" && dob_year == "99"){

    url = '/' + req.params.type + '/deed-not-found-error';
    res.redirect(url);

  } else if (dob_day == "25" && dob_month == "12" && dob_year == "00") {

    url = '/' + req.params.type + '/deed-stopped';
    res.redirect(url);

  } else {

    url = req.params.type + '/how-to-proceed';
    res.render(url);

  }

});

// Route to display error when invalid authentication code entered
router.get('/:type(user_research|future_sprints|current_sprint)/confirming-mortgage-deed', function (req, res) {

  var auth_code = req.query.auth_code;

  if (auth_code == "invalid"){

    url = '/' + req.params.type + '/invalid-authentication-code';
    res.redirect(url);

  } else {

    url = req.params.type + '/confirming-mortgage-deed';
    res.render(url);

  }

});

module.exports = router;
