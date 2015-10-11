
Meteor.publish("articles", function () {
  return articles.find();
});