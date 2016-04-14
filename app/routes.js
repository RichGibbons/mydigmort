var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {

  res.render('index');

});


// Example routes - feel free to delete these

// Passing data into a page

router.get('/examples/template-data', function (req, res) {

  res.render('examples/template-data', { 'name' : 'Foo' });

});

// Branching

router.get('/examples/over-18', function (req, res) {

  // get the answer from the query string (eg. ?over18=false)
  var over18 = req.query.over18;

  if (over18 == "false"){

    // redirect to the relevant page
    res.redirect("/examples/under-18");

  } else {

    // if over18 is any other value (or is missing) render the page requested
    res.render('examples/over-18');

  }

});

// add your routes here

// Route to display an error when invalid reference and/or dob entered
router.get('/:type(user_research|future_sprints|current_sprint)/how-to-proceed', function (req, res) {

  var dob_day = req.query.dob_day;
  var dob_month = req.query.dob_month;
  var dob_year = req.query.dob_year;

  if (dob_day == "25" && dob_month == "12" && dob_year == "0000"){

    url = '/' + req.params.type + '/incorrect-dob-format';
    res.redirect(url);

  } else if (dob_day == "31" && dob_month == "12" && dob_year == "99"){

    url = '/' + req.params.type + '/deed-not-found-error';
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
