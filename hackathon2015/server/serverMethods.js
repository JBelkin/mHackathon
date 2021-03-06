if (Meteor.isServer) {
  Meteor.startup(function () {
    Meteor.call('getRedditJson');
		
		Meteor.setInterval(function() {
			Meteor.call('getRedditJson');
		}, 600000)
  });
}


Meteor.methods({
  getRedditJson: function () { //setInterval
    this.unblock();
    var targets = [
   'WorldNews',
   'news',
   'science',
   'technology',
   'art',
   'business',
   'gaming',
   'politics',
   'sports'
  ];
    for (child in targets) {
      var topic = targets[child];
      console.log('Getting ' + topic + ' Json');
      //console.log(data.data.data.children);
      Meteor.call('checkRedditData', topic); //send JSON to checkRedditData
    }
  },
  checkRedditData: function (topic) { //check against MongoDB if ID exists
    this.unblock();
    var dataQuery = HTTP.get('https://www.reddit.com/r/' + topic + '/hot.json');
    var data = dataQuery.data.data.children;
    var subRedditScore = 0;
    var subRedditComments = 0;
    var dataToCheck = [];
    var dataToUpdate = [];
    for (x in data) {
      subRedditScore += data[x].data.score; //Update this subreddit's total score for our score calc later
      subRedditComments += data[x].data.num_comments; //Update this subreddit's total comments for our score calc later
    }
    for (child in data) {
      var checkArticle = articles.find({ //Search article for matching criteria
        $or: [
          {
            rId: data[child].data.id
          }, //Article unique ID from Reddit
          {
            url: data[child].data.url
          }, //Article URL from Reddit
          {
            title: data[child].data.title
          }
        ]
      }).count();
      if (checkArticle === 0) { //No article found
        //Check if domain is supported
        var articleDetails = Meteor.call('getArticleDetails', data[child].data);
        if (articleDetails != null) { //Article has description, add article details(title, text, image)
          data[child].data.title = articleDetails.headline; //Update title
          data[child].data.previewText = articleDetails.snippet //Add preview text
          data[child].data.preview = articleDetails.multimedia; //Update pictures
        }
        if (data[child].data.thumbnail == "" || data[child].data.thumbnail == null || !data[child].data.preview) { //Has no picture, Search google images using title
          //console.log(encodeURIComponent('"'+data[child].data.title+'"'));
          var imageJSON = HTTP.get('https://ajax.googleapis.com/ajax/services/search/images?v=1.0&q=' + encodeURIComponent('"' + data[child].data.title + '"'));
          var parse = JSON.parse(imageJSON.content);
          if (parse.responseData) {
            var imageUrl = parse.responseData.results[0].unescapedUrl;
          } else {
            var imageUrl = null
          }
          data[child].data.thumbnail = imageUrl;
        }
        //get score
        data[child].data.weightedScore = Meteor.call('scorePost',subRedditScore,subRedditComments, data[child].data.score, data[child].data.num_comments, data[child].data.created_utc);
        //commit to db
        Meteor.call('addRedditData', topic, data[child].data);
      } else { //Article match was found
					//Updating the record - new rScore, 				
					if (data[child].data.thumbnail == "" || data[child].data.thumbnail == null || !data[child].data.preview) { //Has no picture, Search google images using title
						//console.log(encodeURIComponent('"'+data[child].data.title+'"'));
						var imageJSON = HTTP.get('https://ajax.googleapis.com/ajax/services/search/images?v=1.0&q=' + encodeURIComponent('"' + data[child].data.title + '"'));
						var parse = JSON.parse(imageJSON.content);
						if (parse.responseData) {
							var imageUrl = parse.responseData.results[0].unescapedUrl;
						} else {
							var imageUrl = null
						}
						data[child].data.thumbnail = imageUrl;
					}
					data[child].data.weightedScore = Meteor.call('scorePost',subRedditScore,subRedditComments, data[child].data.score, data[child].data.num_comments, data[child].data.created_utc);
					Meteor.call('updateRedditData', topic, data[child].data);
      }
    }
    //check if article id || url exists.  for loop data var. if not found add to dataToCheck else push to dataToUpdate
    //build object with these params -> id, url, created_utc, domain, topic, title, score, subreddit_id, permalink, thumbnail, preview{}
    //if domain = list we can parse, function get description and add to object ELSE if !thumbail || !preview then search google images with title and pull first result.
    //score articles accordingly
  },
  scorePost: function(subRedditScore, subRedditComments, postScore, postComments, postTimestamp, postInterractions){
    this.unblock();
    //create score
    var s = 0;
    //manipulate heat: Check time live
    var ts = new Date().getTime();
    var td = ts - (postTimestamp * 1000);
    var h = Math.round(((td/1000)/60)/60);
    if( h <= 5 ){
      s += 5;
    }else if(h <= 10){
      s += 2.5;
    }else if(h <= 20){
      s += 1;
    }else if(h <= 24){
      s += 0.5;
    }
    //manipulate heat: Check reddit score
    var ps = Math.round((postScore/subRedditScore)*100);
    s += ps;
    //manipulate heat: Check reddit score
    var pc = Math.round((postComments/subRedditComments)*100);
    s += pc
    if(postInterractions){
      console.log(postInterractions); 
    }
    console.log(s, subRedditScore, subRedditComments, postScore, postComments, postTimestamp, postInterractions, ps, pc, h)
    return s;
  },
  addRedditData: function (topic, article) { //add or edit reddit data into MongoDB
    /*
			{
				_id: Meteor provided
				rId: reddit Id
				topic:
				title:
				url:
				previewText:
				thumbnail:
				permLink:
				rDate:
				domain:
				subreddit_id:
				preview:
				date:
				rScore: Reddit Score
				score: Internal Score
			}
		*/
    var articleObj = {
      rId: article.id,
      topic: topic,
      title: article.title,
      url: article.url,
      thumbnail: article.thumbnail,
      permalink: article.permalink,
      rDate: article.created_utc,
      domain: article.domain,
      subreddit_id: article.subreddit_id,
      preview: article.preview,
      date: new Date().getTime(),
      rScore: article.score,
      score: article.weightedScore
    };
    article.previewText != null ? articleObj.previewText = article.previewText : '';
    articles.insert(articleObj);
  },
	updateRedditData: function (topic, article) { //add or edit reddit data into MongoDB

    var articleObj = {
      rId: article.id,
      topic: topic,
      title: article.title,
      url: article.url,
      thumbnail: article.thumbnail,
      permalink: article.permalink,
      rDate: article.created_utc,
      domain: article.domain,
      subreddit_id: article.subreddit_id,
      preview: article.preview,
      date: new Date().getTime(),
      rScore: article.score,
      score: article.weightedScore
    };
    article.previewText != null ? articleObj.previewText = article.previewText : '';
    var old = articles.findOne({rId: articleObj.rId});
		articles.update(old, {articleObj});
  },	
  getArticleDetails: function (article) {
    this.unblock();
    var supportedPlatforms = [
   'nytimes.com'
  ];
    if (supportedPlatforms.indexOf(article.domain) >= 0) {
      if (article.domain == "nytimes.com") {
        var getDetail = Meteor.call('getNYTimesArticle', article.url)
        return getDetail;
      }
    } else {
      return null;
    }
  },
  getNYTimesArticle: function (url) {
    try {
      var getDetail = HTTP.get('http://api.nytimes.com/svc/search/v2/articlesearch.json?fq=web_url:("' + url + '")&api-key=f48f7a8bfe0b984e8d734f98759857d3%3A2%3A73184272')
        //console.log(getDetail.data.response.docs);
        //headline.main, snippet, multimedia
      var result = {
        headline: getDetail.data.response.docs[0].headline.main,
        snippet: getDetail.data.response.docs[0].snippet,
        multimedia: getDetail.data.response.docs[0].multimedia
      };
      return result;
    } catch (e) {
      return null;
      console.log(url, e);
    }
  },
  parseWeather: function (position) {
    var getGeo = HTTP.get('http://api.wunderground.com/api/299167114644cf06/geolookup/q/' + position.latitude + ',' + position.longitude + '.json');
    var trimGeo = getGeo.data.location.requesturl.split('.');
    var result = HTTP.get('http://api.wunderground.com/api/299167114644cf06/conditions/q/' + trimGeo[0] + '.json')
    return result;
  }
});