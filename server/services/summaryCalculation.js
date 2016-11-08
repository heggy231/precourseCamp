import app from '../server';
import _ from 'lodash';
const User = app.models.User;
const Challenge = app.models.Challenge;

function runOnceToUpdateAllScores() {
  User.find({fields: {id: true}}, (err, response)=>{
    if (err) {
      console.log(err);
    } else {
      asynForEach(response, 0, updateUser);
    }
  });
}

// var items = ['one', 'two', 'three', 'four', 'five', 'six', 'seven'];

// This is your async function, which may perform call to your database or
// whatever...
// function someAsyncFunc(arg, cb) {
//   console.log(arg);
//     setTimeout(function() {
//         cb(arg.toUpperCase());
//     }, 100);
// }

// cb will be called when each item from arr has been processed and all
// results are available.

function asynForEach(arr, i, func) {
  if (i == arr.length) {
    return;
  }
    func(arr[i], asynForEach.bind(null, arr, i + 1, func));
}

// function eachAsync(arr, func, cb) {
//     var doneCounter = 0,
//         results = [];
//     arr.forEach(function(item) {
//         func(item, function(res) {
//             doneCounter += 1;
//             results.push(res);
//             if (doneCounter === arr.length) {
//                 cb(results);
//             }
//         });
//     });
// }

// asynForEach(items, 0, someAsyncFunc);


runOnceToUpdateAllScores();

export default function updateUser(user, done) {
  User.findById(user.id, {}, (err, user)=> {
    if (err) {
      console.log(err);
    } else {
      var challenges = _.filter(user.challengeMap,
        e => e.completedDate).map(e => e.id);
      Challenge.find({fields: {block: true, id: true, name: true},
        where: {id: {inq: challenges}}}, (err, response) => {
        if (err) {
          console.log(err);
        } else {
          user.scores = _.countBy(response, 'block');
          user.save(function(err, final) {
            if (err) {
              console.log('Error Saving Scores in summaryCalculation', err);
            }
            if (done) {
              done();
            }
          });
        }
      });
    }
  });
}
