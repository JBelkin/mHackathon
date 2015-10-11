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
		var newPos = {
			latitude: position.coords.latitude,
			longitude: position.coords.longitude
		}
		Meteor.call('parseWeather', newPos, function(e, s) {
			var saveTime = s.data.current_observation;
			var weather = saveTime.temp_f + '° F/' + saveTime.temp_c + '° C - ' + saveTime.weather;
			Session.set('weather', weather);
		});	
		Meteor.setInterval(function() {
			Meteor.call('parseWeather', newPos, function(e, s) {
				var saveTime = s.data.current_observation;
				var weather = saveTime.temp_f + '° F/' + saveTime.temp_c + '° C - ' + saveTime.weather;
				Session.set('weather', weather);
			});	
		}, 60000);
	}
		
});

Template.header.helpers({
	getDate:function() {
		return Session.get('getDate');
		//return '00:00, 6th October 2015';
	},
	getWeather:function(){
		if(Session.get('weather')){
			return Session.get('weather');
		}else{
			
		}
		
	}
});

Template.header.events({
	
});
