import app from '../server';
import _ from 'lodash';
import axios from 'axios';

var User;
var Challenge;

var maxScores;

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
    // TODORemove later
    .catch((err) => {
      return {data: {date_start: '2016-11-14T04:00:00.000Z', err: err}};
    })
    .then(function(response) {
      var startDate;
      if (!user.dateStart &&
         (!response ||
          !response.data ||
          !response.data.date_start)) {
        // TODO Don't do this nonsense once I get it working.  But till then wor
        startDate = new Date('2016-11-14T04:00:00.000Z');
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

// setTimeout(()=>{
//   User.find({}, function(err, response) {
//     if (err) {
//       return console.log(err);
//     }
//       module.exports.setUserStartDate(response[0], {cohortId: 69});
//   });
//
// }, 1000);
