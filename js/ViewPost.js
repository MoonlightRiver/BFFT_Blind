function go_chatting_room(obj){
	var post_key  = obj.parentElement.parentElement.children[0].children[2].innerHTML;
	var user_key  = loginUserKey;
	
	var join = confirm("Wanna Join?");
	if(join){
		var path = '/Posts/' + post_key+'/participants';
		var participant_cnt;
		var first_visit = true;

		firebase.database().ref(path).once("value", function (snapshot) {
			participant_cnt = snapshot.numChildren();
		});

		firebase.database().ref('Posts/'+post_key).once("value", function (snapshot) {

			for (var part in snapshot.val().participants){
				firebase.database().ref(path+'/'+part).once('value', function(snapshot){ 
					var member_uid = snapshot.val().participant;
					if(member_uid==user_key){
						alert("Welcome back!");
						first_visit = false;
					}
				});
			}


			if(snapshot.val().numpeople>participant_cnt){
				if(first_visit){
					firebase.database().ref("Posts/"+post_key+"/participants").push().set({
						"participant": user_key
					});
				}

				localStorage.setItem("post_key", post_key);
				window.history.forward(1);
				location.replace("./ChatRoom.html");
			}
			else{
				if(first_visit){
					alert("Failed. No more seats.");
				}
				else{

					localStorage.setItem("post_key", post_key);
					window.history.forward(1);
					location.replace("./ChatRoom.html");
				}

			}
		});

	}
	else{

	}
}