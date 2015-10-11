articleLoaded = []; //Global Array to hold articles that are loaded to the client
articleSort = {
	leftCol:[],
	midLeftCol:[],
	midRightCol:[],
	rightCol:[]
};
mainArticle = {};
Template.paper.onCreated(function() {
	
});

Template.paper.onRendered(function() {
	var count = 0;
	var colArray = [
		'leftCol',
		'midLeftCol',
		'midRightCol',
		'rightCol'
	];
	Tracker.autorun(function() {
		var BA = articles.findOne({
			previewText:{$exists:true, $nin:[""]},
			thumbnail:{$exists:true, $nin:[""]}
		});
		Session.set('mainArticle', BA);
		articleLoaded.push(BA.rId);
		var data = articles.find().fetch();	
		for (child in data){
			if(articleLoaded.indexOf(data[child].rId) < 0){
				articleLoaded.push(data[child].rId)
				articleSort[colArray[count]].push(data[child]);
				count++;
				if(count == 4) { count = 0; }
			}		
		}
		Session.set('articles', articleSort);
	});
	
	
});

Template.paper.helpers({
	leftColArticle:function(){
		return Session.get('articles').leftCol;
	},
	midLeftColArticle:function(){
		return Session.get('articles').midLeftCol;
	},
	midRightColArticle:function(){
		return Session.get('articles').midRightCol;
	},
	rightColArticle:function(){
		return Session.get('articles').rightCol;
	},
	thumbnail:function(){
		if(this.thumbnail == null){
			return true;
		}
	}
});

Template.paper.events({
	
});


Template.bigArticle.helpers({
	title:function(){
		if(Session.get('mainArticle')){
			return Session.get('mainArticle').title;
		}
	},
    thumbnail:function(){
		if(Session.get('mainArticle')){
			return Session.get('mainArticle').thumbnail;
		}
	},
    previewText:function (){
		if(Session.get('mainArticle')){
			return Session.get('mainArticle').previewText;
		}
    }
})
