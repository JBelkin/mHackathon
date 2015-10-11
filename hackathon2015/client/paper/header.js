Template.header.onCreated(function() {
	
});

Template.header.onRendered(function() {
	Meteor.setInterval(function() {
		Session.set('getDate', new Date().toLocaleString());	
	}, 1000);
	
	if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showWeather);
	}
	function showWeather(position) {
		console.log(position);
		//https://maps.googleapis.com/maps/api/geocode/json?latlng=40.714224,-73.961452&key=API_KEY
		//var location = Meteor.call('reverseGeolocation', position)
		Meteor.setInterval(function() {
			
		}, 60000);
	}
		
});

Template.header.helpers({
	getDate:function() {
		return Session.get('getDate');
		//return '00:00, 6th October 2015';
	},
	getWeather:function(){
		return '69° Light Rain';
	}
});

Template.header.events({
	
});