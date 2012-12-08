// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Meteor.Collection("players");

if (Meteor.isClient) {
  Template.challengeboard.players = function () {
    if (Session.get('sortByName') === 'true'){
      return Players.find({}, {sort: {name: 1}});
    }
    else {
      return Players.find({}, {sort: {score: -1}});     
    }
  };

  Template.challengeboard.selected_name = function () {
    var player = Players.findOne(Session.get("selected_player"));
    return player && player.name;
  };

  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  Template.challengeboard.events({
    'click input.inc': function () {
      Players.update(Session.get("selected_player"), {$inc: {score: 5}});
    },
     'click .random': function () {
	var random_score = Math.floor(Math.random()*10)*5;
        Players.find().forEach(function (player) {   
             Players.update({_id: player._id}, {$set: {score: random_score}});
       });
    }
  });

  Template.player.events({
    'click': function () {
      Session.set("selected_player", this._id);
    },
    'click .delete': function(){
      Players.remove(this._id);
    }
  });
  
  Template.sortBy.sortByName = function () {
    if (Session.get('sortByName') === 'true'){
      return true;
    }
    else {
	  return false;     
	}
  };

  Template.sortBy.events = ({
     'click .score': function(){
     Session.set('sortByName', 'false');
     },
     
     'click .name': function(){
     Session.set('sortByName', 'true');
     }
  });

  // used for validation
  Template.new_player.error = function () {
    return Session.get("error");
  };

  Template.new_player.events = ({
     'click .add': function(){
     var new_player_name = document.getElementById("new_player_name").value.trim();
     if (PlayerValidator.valid_name(new_player_name)) {
      	Players.insert({name: new_player_name, score: 0});
     } 
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
  });
}
