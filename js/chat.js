var $messages = $('.messages-content'),
d, h, m,
i = 0;

var myName = "";
var post_key_value = localStorage.getItem("post_key");

$(window).load(function() {
    setupRoom(post_key_value);
    userSessionCheck();
});

function updateScrollbar() {
    $messages.mCustomScrollbar("update").mCustomScrollbar('scrollTo', 'bottom', {
        scrollInertia: 10,
        timeout: 0
    });
}

function insertMessage() {
    msg = $('.message-input').val();
    if ($.trim(msg) == '') {
        return false;
    }
    sendMessage();
}

$('.message-submit').click(function() {
    insertMessage();
});

$(window).on('keydown', function(e) {
    if (e.which == 13) {
        insertMessage();
        return false;
    }
});

function setupRoom(post_key_value) {
    var path = '/Posts/' + post_key_value;
    var member_path = path+'/participants';
    var participant_cnt;

    firebase.database().ref(member_path).once("value", function (snapshot) {
        participant_cnt = snapshot.numChildren();
    });

    firebase.database().ref(path).once('value', function(snapshot){ 
        console.log(path);
        var data = snapshot.val();
        console.log(data);

        //alert(data['name']);

        var title_ = document.getElementById("title");
        var restaurant_ = document.getElementById("restaurant");
        var participants_ = document.getElementById("member-list");
        var member_rank_ = document.getElementById("member_rank");
        /*
        var where_ = document.getElementById("Where");
        var with_ = document.getElementById("With");
        var what_ = document.getElementById("What");
        var how_long_ = document.getElementById("How_long");
        var why_ = document.getElementById("Why");
        var what_you_felt_ = document.getElementById("What_you_felt");
        */
        //alert(title_.innerHTML);
        title_.innerHTML = data['title'];
        restaurant_.innerHTML = data['restaurant'];
        participants_.innerHTML = "Members ["+participant_cnt+"/"+data['numpeople']+"]"
        console.log(member_rank_.innerHTML);

        /*
        how_long_.value = data['How_long'];
        what_.value = data['What_you_did'];
        what_you_felt_.value = data['What_you_felt'];
        where_.value = data['Where'];
        why_.value = data['Why'];
        with_.value = data['With_whom'];
        importance_ = data['importance'];
        */

        for(var i=1; i<=participant_cnt; i++){
            member_rank_.innerHTML += '<li class="list-group-item d-flex justify-content-between align-items-center"><span id="member'+i+'">Member '+i+'</span><span class="badge badge-primary badge-pill">'+i+'</span></li>'
            //console.log(data['participants']);
            

            /*
            var member_i_uid = data['participants'].children[0];
            console.log(member_i_uid);
            firebase.database().ref('/users/'+member_i_uid).once('value', function(snapshot){ 
                //console.log(snapshot.val());
                member_i_.innerHTML = snapshot.val().nickname;
            });
            */
        }
        
        var mem_arr = [];
        var member_i_;
        var i = 0;
        var cnt = 0;
        for (var part in data['participants']){
            i++;
            member_i_ = document.getElementById("member"+i);
            mem_arr.push("member"+i);
            console.log(member_i_.id);
            firebase.database().ref(member_path+'/'+part).once('value', function(snapshot){ 
                var member_i_uid = snapshot.val().participant;
                firebase.database().ref('/users/'+member_i_uid).once('value', function(snapshot){ 
                    console.log(snapshot.val());
                    document.getElementById(mem_arr[cnt]).innerHTML = snapshot.val().nickname;
                    cnt++;
                        //member_i_.innerHTML = snapshot.val().nickname;
                        //alert("member_"+i+" : "+member_i_.innerHTML);
                    });
            });
        }
    });
}

//유저가 로그인 했는지 안했는지 확인해주는 함수
function userSessionCheck() {

    //로그인이 되어있으면 - 유저가 있으면, user를 인자값으로 넘겨준다.
    firebaseEmailAuth.onAuthStateChanged(function (user) {

        if (user) {
            //조회 - 데이터 베이스에 저장된 닉네임을 현재 접속되어 있는 user의 pk key 값을 이용해서 가져오기
            firebaseDatabase.ref("users/" + user.uid).once('value').then(function (snapshot) {
                //자바스크립트 dom 선택자를 통해서 네비게이션 메뉴의 엘리먼트 변경해주기
                myName = snapshot.val().nickname;

                loadMessages();
                document.getElementById("loginmenu").textContent = "logout";
                document.getElementById("loginmenu").href = "Logout.html";
                document.getElementById("joinmenu").textContent = "Welcome! " + snapshot.val().nickname;
                document.getElementById("joinmenu").href = "#";

                name = snapshot.val().name;   //유저 닉네임은 계속 쓸거기 때문에 전역변수로 할당
                loginUserKey = snapshot.key;  //로그인한 유저의 key도 계속 쓸 것이기 때문에 전역변수로 할당
                userInfo = snapshot.val(); //snapshot.val()에 user 테이블에 있는 해당 개체 정보가 넘어온다. userInfo에 대입!


                //alert(userInfo.userid);  //uid는 db에서 user 테이블의 각 개체들의 pk 인데, 이 값은 인증에서 생성된 아이디의 pk 값과 같다. *중요!

                return true
            });

        } else {
            return false
        }
    });
}

function loadMessages() {
    $messages.mCustomScrollbar();

    firebase.database().ref("Posts/"+post_key_value+"/messages").on("child_added", function (snapshot) {
        if (snapshot.val().sender == myName) {
            $('<div class="message message-personal"><figure class="avatar"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpdX6tPX96Zk00S47LcCYAdoFK8INeCElPeJrVDrh8phAGqUZP_g" /></figure><div id="message-' + snapshot.key + '">' + snapshot.val().message + '<button class="btn-delete" data-id="' + snapshot.key + '" onclick="deleteMessage(this);">Delete</button></div></div>').appendTo($('.mCSB_container')).addClass('new');
            $('.message-input').val(null);
        } else {
            $('<div class="message new"><figure class="avatar"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpdX6tPX96Zk00S47LcCYAdoFK8INeCElPeJrVDrh8phAGqUZP_g" /></figure><div id="message-' + snapshot.key + '">' + snapshot.val().sender + ': ' + snapshot.val().message + '</div></div>').appendTo($('.mCSB_container')).addClass('new');
        }
        updateScrollbar();
    });

    firebase.database().ref("Posts/"+post_key_value+"/messages").on("child_removed", function (snapshot) {
        var messageId = snapshot.key;
        var element = document. getElementById("message-"+messageId);
        element.parentNode.parentNode.removeChild(element.parentNode);
        updateScrollbar();
    });
}