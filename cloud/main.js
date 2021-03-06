Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi');
});

Parse.Cloud.define("notifyAllUsers", function(request, response) {
  var title = "notifyTest";
  var message = "this is a test post";

  Parse.Push.send({
    where: {
      "deviceType": {
        "$in": ["ios", "android"]
      }
    },
    data: {
      title: title,
      alert: message
    }
  }, {
    success: function() {
      // Push was successful
      response.success("notification sent");
    },
    error: function(error) {
      // Handle error
      response.error("Push failed to send : " + error.message + " " + title + " " + message);
    },
    useMasterKey: true
  });

});


Parse.Cloud.define("notifyFollowers", function(request, response) {

  var senderUserId = request.params.senderId;
  var title = request.params.title;
  var message = request.params.message;
  //Classes being used
  var senderUser = new Parse.User();
  senderUser.id = senderUserId;
  var Favorites = new Parse.Object.extend("Favorites");


  //Queries needed
  var pushQuery = new Parse.Query(Parse.Installation);
  var favoriteQuery = new Parse.Query(Favorites);
  var userQuery = new Parse.Query(Parse.User);

  //Get all favorites where favorite = userid
  favoriteQuery.equalTo("favorite", senderUser);
  favoriteQuery.include("follower", {
    __type: "Pointer",
    className: "_User"
  });
  favoriteQuery.find({
    success: function(results) {
      //arraylist of users
      var listOfUsers = [];

      for (var i = 0; i < results.length; i++) {
        listOfUsers.push(results[i].get("follower"));
      }
      pushQuery.containedIn("pUser", listOfUsers);

      //Send a push notification
      Parse.Push.send({
        where: pushQuery,
        data: {
          title: title,
          alert: message
        }
      }, {
        success: function() {
          // Push was successful
          response.success("notification sent");
        },
        error: function(error) {
          // Handle error
          response.error("Push failed to send : " + error.message + " " + title + " " + message);
        },
        useMasterKey: true
      });

    },
    error: function(error) {

    },
    useMasterKey: true
  });

});


Parse.Cloud.define("getAllFollowers", function(request, response) {
  var favoriteUser = request.params.user;

});

Parse.Cloud.define("sendPushToUser", function(request, response) {
  var senderUser = request.user;
  var recipientUserId = request.params.recipientId;
  var message = request.params.message;
  var title = request.params.title;
  var is_background = request.params.isBackground;


  // Validate the message text.
  // For example make sure it is under 140 characters
  if (message.length > 140) {
    // Truncate and add a ...
    message = message.substring(0, 137) + "...";
  }

  // Send the push.
  // Find devices associated with the recipient user
  var recipientUser = new Parse.User();
  recipientUser.id = recipientUserId;
  var pushQuery = new Parse.Query(Parse.Installation);
  pushQuery.equalTo("pUser", recipientUser);

  // Send the push notification to results of the query
  Parse.Push.send({
    where: pushQuery,
    data: {
      title: title,
      alert: message
    }
  }, {
    success: function() {
      // Push was successful
      response.success("notification sent");
    },
    error: function(error) {
      // Handle error
      response.error("Push failed to send : " + error.message + " " + title + " " + message);
    },
    useMasterKey: true
  });


});
