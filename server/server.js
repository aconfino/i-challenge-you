// On server startup, create some players if the database is empty.
Players = new Meteor.Collection("players");
Challenges = new Meteor.Collection("challenges");

Meteor.startup(function () {
   
    if (Players.find().count() === 0) {
      var names = ["Joel Confino",
                   "Lane Harlon"];
      for (var i = 0; i < names.length; i++)
        Players.insert({name: names[i], score: 0});
    }

    if (Challenges.find().count() === 0){
        Challenges.insert({name: 'Ate 3 healthy meals', points: 5});
        Challenges.insert({name: 'Aerobic workout - 20+ min', points: 3});
        Challenges.insert({name: 'Anaerobic workout - 20+ min ', points: 3});
        Challenges.insert({name: 'Skipped snacks', points: 2});
        Challenges.insert({name: 'Good nights rest', points: 2});
        Challenges.insert({name: 'Walk - 15+ min', points: 1});
        Challenges.insert({name: 'Took the steps', points: 1});
    }
});

