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
 * Middleware to expose custom data to the views
 */
router.use(function(req, res, next) {

  res.locals.data = require('./data');

  res.locals.data.verifyUrl = process.env.VERIFY_URL || res.locals.data.verifyUrl;

  next();
});

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
 *
 * This route applies to versions 6 and above
 */
router.use(function(req, res, next) {

  // If we're on a page containing the verify button
  if(req.originalUrl.indexOf('start-page') !== -1) {

    // Store the current URL
    var url = req.protocol + "://" + req.get('host') + req.originalUrl;

    // Replace the last component of the path with the return page
    console.log("session mode = " + req.session['mode']);
    if(req.session['verify'] == 'non-exact-match') {
      url = url.replace('start-page', 'borrower-reference');
    } else {
      url = url.replace('start-page', 'identity-verified');
    }

    // And bosh it in the session
    req.session['verify-return-url'] = url;
    console.log('Setting verify return URL to', url)


  // If we're returning from verify (to the current fixed URL)
  // And we've got a URL value in the session
  } else if (req.originalUrl.indexOf('identity-verfied') !== -1 && req.session['verify-return-url']) {

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


/**
 * Middleware to provide a "hack" which allows us to redirect the prototype
 * back to the appropriate page in our application. This allows multiple proto
 * variants to be created and for them to return to the correct place when
 * coming back from the verify prototype
 *
 * LEGACY - This applies to versions 5ish and before...
 */
router.use(function(req, res, next) {

  // If we're on a page containing the verify button
  if(req.originalUrl.indexOf('sign-my-mortgage') !== -1) {

    // Store the current URL
    var url = req.protocol + "://" + req.get('host') + req.originalUrl;

    // Replace the last component of the path with the return page
    console.log("session mode = " + req.session['mode']);
    if(req.session['verify'] == 'non-exact-match') {
      url = url.replace('sign-my-mortgage', 'borrower-reference');
    } else {
      url = url.replace('sign-my-mortgage', 'how-to-proceed');
    }

    // And bosh it in the session
    req.session['verify-return-url'] = url;
    console.log('Setting verify return URL to', url)


  // If we're returning from verify (to the current fixed URL)
  // And we've got a URL value in the session
  // *** commented out to see if bad redirect is avoided when going backwards into Verify *** //   
  //} else if (req.originalUrl.indexOf('service_vision/how-to-proceed') !== -1 && req.session['verify-return-url']) {

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

// Dialog trigger route
global.dialog_id = false

router.get('/dialog-trigger', function (req, res) {
  var showDialog = global.dialog_id

  if(showDialog) {
    global.dialog_id = false
  }

  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');

  res.json({
    dialog_id: showDialog
  })
});

router.post('/dialog-trigger', function (req, res) {
  global.dialog_id = req.body.dialog_id
  res.send(200)
});

// Redirect trigger route
global.redirect_destination = false

router.get('/redirect-trigger', function (req, res) {
  var redirect_destination = global.redirect_destination

  if(redirect_destination) {
    global.redirect_destination = false
  }

  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');

  res.json({
    redirect_destination: redirect_destination
  })
});

router.post('/redirect-trigger', function (req, res) {
  global.redirect_destination = req.body.redirect_destination
  res.send(200)
});

module.exports = router;
