articleLoaded = []; //Global Array to hold articles that are loaded to the client
articleSort = {
  leftCol: [],
  midLeftCol: [],
  midRightCol: [],
  rightCol: []
};
mainArticle = {};
sections = 0;
var topics = {
  'WorldNews':{
    icon:'ion-earth',
    displayName:"World News"
  },
  'news':{
    icon:'ion-ios-paper-outline',
    displayName:"News"
  },
  'science':{
    icon:'ion-erlenmeyer-flask',
    displayName:"Science"
  },
  'technology':{
    icon:'ion-monitor',
    displayName:"Technology"
  },
  'art':{
    icon:'ion-paintbrush',
    displayName:"Art"
  },
  'business':{
    icon:'ion-ios-people-outline',
    displayName:"Business"
  },
  'gaming':{
    icon:'ion-ios-game-controller-b-outline',
    displayName:"Gaming"
  },
  'politics':{
    icon:'ion-speakerphone',
    displayName:"Politics"
  },
  'sports':{
    icon:'ion-ios-baseball-outline',
    displayName:"Sports"
  }
}
Session.set('topics',topics);
Template.paper.onCreated(function () {

});

Template.paper.onRendered(function () {
  var count = 0;
  var colArray = [
  'leftCol',
  'midLeftCol',
  'midRightCol',
  'rightCol'
 ];
  Tracker.autorun(function () {
    var ss = [];
    var fs = 0;
    var BA = articles.findOne({
      previewText: {
        $exists: true,
        $nin: [""]
      },
      thumbnail: {
        $exists: true,
        $nin: [""]
      }
    });
    Session.set('mainArticle', BA);
    if(BA){
      articleLoaded.push(BA.rId);
    }
    var param = {}
    var y = Session.get('tagFilter');
    if(y){
      param.topic = y;
    }
    var data = articles.find(
      param,
      {sort:
        {
          score : -1 
        },
        reactive: true
      }
    ).fetch();
    for (child in data) {
      if (articleLoaded.indexOf(data[child].rId) < 0) {
        articleLoaded.push(data[child].rId)
        data[child].date = moment(data[child].date).fromNow();
        articleSort[colArray[count]].push(data[child]);
        ss.push(data[child].score);
        count++;
        if (count == 4) {
          count = 0;
        }
      }
    }
    Session.set('articles', articleSort);
    for(child in ss){
      if(fs < ss[child]){
        fs = ss[child]; 
      }
    }
    Session.set('scoreDivider', fs/10)
  });


});

Template.paper.helpers({
  leftColArticle: function () {
    var y = Session.get('tagFilter');
    if(y){
      var a = Session.get('articles').leftCol;
      var x = [];
      for(child in a){
        if(a[child].topic == y){
          x.push(a[child]); 
        }
      }
      return x;
    }else{
      return Session.get('articles').leftCol;
    }
  },
  midLeftColArticle: function () {
    var y = Session.get('tagFilter');
    if(y){
      var a = Session.get('articles').midLeftCol;
      var x = [];
      for(child in a){
        if(a[child].topic == y){
          x.push(a[child]); 
        }
      }
      return x;
    }else{
      return Session.get('articles').midLeftCol;
    }
  },
  midRightColArticle: function () {
    var y = Session.get('tagFilter');
    if(y){
      var a = Session.get('articles').midRightCol;
      var x = [];
      for(child in a){
        if(a[child].topic == y){
          x.push(a[child]); 
        }
      }
      return x;
    }else{
      return Session.get('articles').midRightCol;
    }
  },
  rightColArticle: function () {
    var y = Session.get('tagFilter');
    if(y){
      var a = Session.get('articles').rightCol;
      var x = [];
      for(child in a){
        if(a[child].topic == y){
          x.push(a[child]); 
        }
      }
      return x;
    }else{
      return Session.get('articles').rightCol;
    }
  },
  score: function(){
    var s = this.score;
    var d = Session.get('scoreDivider');
    var fs = s/d;
    if(fs>9){
      fs = 9; 
    }else if(fs < 1){
      fs = 0; 
    }
    fs = Math.floor(fs);
    return fs;
  },
  topic: function(){
    var topics = Session.get('topics');
    return topics[this.topic];
  }
});

Template.paper.events({

});


Template.bigArticle.helpers({
  title: function () {
    if (Session.get('mainArticle')) {
      return Session.get('mainArticle').title;
    }
  },
  url:function() {
      if(Session.get('mainArticle')){
        return Session.get('mainArticle').url;
      }
  },
  thumbnail: function () {
    if (Session.get('mainArticle')) {
      return Session.get('mainArticle').thumbnail;
    }
  },
  previewText: function () {
    if (Session.get('mainArticle')) {
      return Session.get('mainArticle').previewText;
    }
  },
  timeLive: function(){
    if (Session.get('mainArticle')) {
      return moment(Session.get('mainArticle').date).fromNow();
    }
  },
  topic: function(){
    if (Session.get('mainArticle')) {
      return Session.get('mainArticle').topic;
    }
  },
  domain:function(){
    if (Session.get('mainArticle')) {
      return Session.get('mainArticle').domain;
    }
  }
});

Template.article.helpers({
  thumbnail: function () {
    if (this.thumbnail == null) {
      return true;
    }
  }
});
