var $messages = $('.messages-content'),
    d, h, m,
    i = 0;
var count = 0;
var junk = -1;
var mem_arr2 = [];
var myName = "";
var post_key_value = localStorage.getItem("post_key");

$(window).load(function() {
    userSessionCheck();
    setupRoom(post_key_value);


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





        for(var i=1; i<participant_cnt; i++){
            document.getElementById("comment-"+i).textContent = "Comment";
        }

        var mem_arr = [];
        var member_i_;

        var i = 0;
        var cnt = 0;
        for (var part in data['participants']){
            firebase.database().ref(member_path+'/'+part).once('value', function(snapshot){
                var member_i_uid = snapshot.val().participant;

                if (member_i_uid != myName){
                    i++;
                    member_i_ = document.getElementById("title"+i);
                    mem_arr.push("title"+i);
                    console.log(member_i_.id);
                    var member_i_uid = snapshot.val().participant;
                    mam_arr2 = mem_arr2.push(member_i_uid)

                    firebase.database().ref('/users/'+member_i_uid).once('value', function(snapshot){
                        console.log(snapshot.val());
                        document.getElementById(mem_arr[cnt]).innerHTML = snapshot.val().nickname;
                        cnt++;
                        //member_i_.innerHTML = snapshot.val().nickname;
                        //alert("member_"+i+" : "+member_i_.innerHTML);
                    });
                }else{
                    junk = i+1
                }
            });

        }
    });
}

function userSessionCheck() {

    //로그인이 되어있으면 - 유저가 있으면, user를 인자값으로 넘겨준다.
    firebaseEmailAuth.onAuthStateChanged(function (user) {

        if (user) {
            //조회 - 데이터 베이스에 저장된 닉네임을 현재 접속되어 있는 user의 pk key 값을 이용해서 가져오기
            firebaseDatabase.ref("users/" + user.uid).once('value').then(function (snapshot) {
                //자바스크립트 dom 선택자를 통해서 네비게이션 메뉴의 엘리먼트 변경해주기
                myName = snapshot.val().nickname;


                name = snapshot.val().name;   //유저 닉네임은 계속 쓸거기 때문에 전역변수로 할당
                loginUserKey = snapshot.key;  //로그인한 유저의 key도 계속 쓸 것이기 때문에 전역변수로 할당
                myName = loginUserKey
                userInfo = snapshot.val(); //snapshot.val()에 user 테이블에 있는 해당 개체 정보가 넘어온다. userInfo에 대입!

                //alert(userInfo.userid);  //uid는 db에서 user 테이블의 각 개체들의 pk 인데, 이 값은 인증에서 생성된 아이디의 pk 값과 같다. *중요!

                return true
            });

        } else {
            return false
        }
    });
}


$("#but").click(function() {

    mem_arr2.forEach( id => set_rate(id)
    )
    window.location.href = "ViewPost.html";
});
function set_rate(id){
    count++;
    input = document.getElementById("input-" + count);
    var ref = firebase.database().ref("users/" + id);
    ref.push().set({
        "rate": input.value
    });
}

