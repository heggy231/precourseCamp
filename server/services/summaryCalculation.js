import app from '../server';
import _ from 'lodash';
const User = app.models.User;
const Challenge = app.models.Challenge;

function runOnceToUpdateAllScores() {
  User.find({fields: {id: true}}, (err, response)=>{
    if (err) {
      console.log(err);
    } else {
      response.forEach(e=>updateUser(e));
    }
  });
}

// runOnceToUpdateAllScores();

export default function updateUser(user) {
  console.log(user);
  setTimeout(()=>{
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
            });
          }
        });
      }
    });
  }, 1000);
  Challenge.find();
}
