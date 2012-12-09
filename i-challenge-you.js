// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Meteor.Collection("players");
Challenges = new Meteor.Collection("challenges");

if (Meteor.isClient) {
  Template.playerboard.players = function () {
      return Players.find({}, {sort: {score: -1}});     
  };

  Template.playerboard.selected_name = function () {
    var player = Players.findOne(Session.get("selected_player"));
    return player && player.name;
  };

  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  Template.player.events({
    'click': function () {+
      Session.set("selected_player", this._id);
    },
    'click .delete': function(){
      Players.remove(this._id);
    }
  });

  // used for validation
  Template.new_player.error = function () {
    return Session.get("error");
  };

  Template.new_player.events = ({
     'click .addPlayer': function(){
     var new_player_name = document.getElementById("new_player_name").value.trim();
     if (PlayerValidator.valid_name(new_player_name)) {
      	Players.insert({name: new_player_name, score: 0});
     } 
   }
  });


  Template.challengeboard.challenges = function () {
      return Challenges.find({}, {sort: {points: -1}});
  };

  Template.challenge.events = ({
     'click .addPoints': function (event, template) {
    var points = parseInt(template.find(".addPoints").value);
    Players.update(Session.get("selected_player"), {$inc: {score: points}});
   }
  });

  
}

PlayerValidator = {
  clear: function () { 
    return Session.set("error", undefined); 
  },
  set_error: function (message) {
    return Session.set("error", message);
  },
  valid_name: function (name) {
    this.clear();
    if (name.length == 0) {
      this.set_error("Name can't be blank");
      return false;
    } else if (this.player_exists(name)) {
      this.set_error("Player already exists");
      return false;
    } else {
      return true;
    }
  },
  player_exists: function(name) {
    return Players.findOne({name: name});
  }
};


// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Players.find().count() === 0) {
      var names = ["Ada Lovelace",
                   "Grace Hopper",
                   "Marie Curie",
                   "Carl Friedrich Gauss",
                   "Nikola Tesla",
                   "Claude Shannon"];
      for (var i = 0; i < names.length; i++)
        Players.insert({name: names[i], score: Math.floor(Math.random()*10)*5});
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
}
