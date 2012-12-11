Ichallenges = new Meteor.Collection("ichallenges");

Ichallenges.allow({
  insert: function (userId, ichallenge) {
    return false; // use createIChallenge method
  },
  update: function (userId, ichallenge, fields, modifier) {
    return _.all(parties, function (party) {
      if (userId !== ichallenge.owner)
        return false; // not the owner

      var allowed = ["title", "description", "x", "y"];
      if (_.difference(fields, allowed).length)
        return false; // tried to write to forbidden field

      // A good improvement would be to validate the type of the new
      // value of the field (and if a string, the length.) In the
      // future Meteor will have a schema system to makes that easier.
      return true;
    });
  },
  remove: function (userId, ichallenges) {
    return ! _.any(parties, function (ichallenge) {
      // deny if not the owner, or if other people are going
      return ichallenge.owner !== userId;
    });
  }
});

Meteor.methods({
  // options should include: title, description
  createIChallenge: function (options) {
    options = options || {};
    if (! (typeof options.title === "string" && options.title.length &&
           typeof options.description === "string" &&
           options.description.length ))
      throw new Meteor.Error(400, "Required parameter missing");
    if (options.title.length > 100)
      throw new Meteor.Error(413, "Title too long");
    if (options.description.length > 1000)
      throw new Meteor.Error(413, "Description too long");
    if (! this.userId)
      throw new Meteor.Error(403, "You must be logged in");

    return Challenges.insert({
      owner: this.userId,
      title: options.title,
      description: options.description,
      invited: [],
      rsvps: []
    });
  },

  invite: function (iChallengeId, userId) {
    var iChallenge = Ichallenges.findOne(iChallengeId);
    if (! iChallenge || iChallenge.owner !== this.userId)
      throw new Meteor.Error(404, "No such iChallenge");
    if (userId !== iChallenge.owner && ! _.contains(iChallenge.invited, userId)) {
      Ichallenges.update(iChallengeId, { $addToSet: { invited: userId } });

      var from = contactEmail(Meteor.users.findOne(this.userId));
      var to = contactEmail(Meteor.users.findOne(userId));
      if (Meteor.isServer && to) {
        // This code only runs on the server. If you didn't want clients
        // to be able to see it, you could move it to a separate file.
        Email.send({
          from: "noreply@example.com",
          to: to,
          replyTo: from || undefined,
          subject: "I challenge you to: " + piChallenge.title,
          text:"Hey, I just challenged you to '" + iChallenge.title +
          "\n\nCome check it out: " + Meteor.absoluteUrl() + "\n"
        });
      }
    }
  }
});

