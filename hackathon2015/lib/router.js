	Router.route('/', {
		name: 'mainLayout',
		loadingTemplate: 'loader',
		waitOn:function(){
			return [
				Meteor.subscribe('articles')
			]
		},
		onBeforeAction:function(){
			this.next();
		}
	});