import app from '../server';
import _ from 'lodash';
import axios from 'axios';

var User;
var Challenge;

var maxScores;

var checkpoints = [{
  label: 'JavaScript Part 1',
  days: 4 * 7
}, {
  label: 'JavaScript Part 2',
  days: 3 * 7
}, {
  label: 'JavaScript Part 3',
  days: 2 * 7
}, {
  label: 'HTML5 and CSS',
  days: 1.5 * 7
}, {
  label: 'jQuery',
  days: 1 * 7
} ];

function calcMaxScores() {
  setTimeout(function() {
    User = app.models.User;
    Challenge = app.models.Challenge;
    Challenge.find({}, function(err, challenges) {
      if (err) {
        console.log(err);
      }
      maxScores = _.countBy(challenges, 'block');
    });
  }, 1000);
}

calcMaxScores();

module.exports = {
  formatDate: formatDate,
  checkUser: function checkUser(user) {
    if (!maxScores) maxScores = scoreReporting.localMaxScore();
    var setions = ['JavaScipt Part 1', 'JavaScipt Part 2', 'JavaScipt Part 3', 'HTML5 and CSS', 'jQuery'];

    if (!user.dateStart) {
      user.status = 'Applying';
      user.class = 'completed';
      user.message = 'In order to finish your application process for DevMountain, complete JavaScript Part 1.';
      user.checkpoints = [{
        label: 'JavaScript Part 1',
        status: 'danger',
        icons: 'fa fa-exclamation-triangle'
      }];
      return;
    }

    user.completed = 0;

    user.checkpoints = checkpoints.map(checkCheckpoint.bind(null, user));

    user.status = 'On Track';
    user.class = 'ok';
    user.message = "You're on track to start the course on " + formatDate(user.dateStart) + ".  Keep up the pace.  The better prepared you are when you come in, the more you'll make out of your time and tuition.";

    if (user.completed == 5) {
      user.message = "You're all set to start the course on " + formatDate(user.dateStart) + '. But there\'s always more you can do to prepare.  Try some of the other JavaScript challenges, redo old challenges to see if you can do them faster, or build some more web pages if you want to focus on design.';
      user.status = 'Good to go!';
      user.class = 'completed';

    } else if (user.danger) {
      user.status = 'Danger of deffering';
      user.message = "Looks like you're quite behind where you should be. You may not be able to start on " + formatDate(user.dateStart) + '. ';
      user.class = 'danger';
      user.icons = 'fa fa-exclamation-triangle';
    } else if (user.warning) {
      user.status = 'Slightly behind';
      user.message = 'You are running a little behind to be ready by the ' + formatDate(user.dateStart) + '.  Make sure to spend a bit more time this week to get caught up.';
      user.class = 'warning';
      user.icons = 'fa fa-exclamation-triangle';
    }
  },
  localMaxScore: function() {
    return maxScores;
  },
  getMaxScores: function(req, res) {
    if (maxScores) {
      return res.send(maxScores);
    }
    return setTimeout(()=>res.send(maxScores), 1000);
  },
  setUserStartDate: function(user, devMtnProfile) {
    if (!devMtnProfile.cohortId) {return;}
    axios.get('https://devmountain.com/api/classsession/' +
    devMtnProfile.cohortId)
    .then(function(response) {
      var startDate;
      if (!user.dateStart &&
         (!response ||
          !response.data ||
          !response.data.date_start)) {
      } else {
        startDate = new Date(response.data.date_start || user.dateStart);
      }
      if (new Date(user.dateStart).getTime() !==
      startDate.getTime()) {
        User.update({id: user.id},
          {dateStart: response.data.date_start},
          (err, response) => {
          if (err) {
            return console.log(err);
          }
          return response;
        });
      }
    }).catch(function(err) {
      if (err) {
        console.log(err);
      }
    });
  }
};

function formatDate(date, days) {
    if (days) {
      date = new Date(date.getTime() - days * 1000 * 60 * 60 * 24);
    }
    var months = [
    'Jan', 'Feb', 'Mar',
    'Apr', 'May', ' Jun',
    'Jul', 'Aug', 'Sep',
    'Oct', 'Nov', 'Dec'];
    return months[date.getMonth()] + ' ' + date.getDate();
}

function checkCheckpoint(user, i) {
  // Calculate date in question
  var day;
  if (!user.dateStart) {
    day = new Date();
  } else {
    day = new Date(user.dateStart.getTime() -
       i.days * 1000 * 60 * 60 * 24);
  }

  // Setup the basic result that all share.
    var result = {
      label: i.label,
      days: i.days,
      dateString: formatDate(day)
    };
    if (user.scores[i.label] >= maxScores[i.label]) {
      result.complete = true;
      result.class = 'complete';
      user.completed++;
      return result;
    } else {
      result.complete = false;
      var daysBehind = new Date().getTime() - day.getTime();
      daysBehind /= 1000 * 60 * 60 * 24;
      if (daysBehind >= 7) {
        result.class = 'danger';
        result.icons = 'fa fa-exclamation-triangle';
        user.danger = true;
      } else if (daysBehind > 0) {
        result.class = 'warning';
        result.icons = 'fa fa-exclamation-triangle';
        user.warning = true;
      } else {
        result.class = 'ok';
      }
      return result;
    }
}
