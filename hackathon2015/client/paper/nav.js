Template.nav.helpers({
  tags:function(){
    var t = Session.get('topics');
    var r = [];
    for(child in t){
      r.push({
        filterName:child,
        displayName:t[child].displayName
      }); 
    }
    return r;
  }
})

Template.nav.events({
  'click .tag':function(e){
    e.preventDefault();
    console.log(e.target.classList[0]);
    Session.set('tagFilter',e.target.classList[0]);
  }
})