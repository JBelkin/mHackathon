/*	Router.route('/', function() {
		this.render('mainLayout');
	});*/

	Router.route('/', {
		name: 'mainLayout',
		waitOn:function(){
			return [
				Meteor.subscribe('articles')
			]
		},
		onBeforeAction:function(){
			this.next();
		}
	});