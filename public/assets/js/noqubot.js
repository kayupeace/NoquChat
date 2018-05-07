
function show(){
    'use strict';
    var p = document.getElementsByClassName('password');
    let i;
    for(i=0; i < p.length; i++) {
        p[i].setAttribute('type', 'text');
    }
    document.getElementById('eye').className = 'fa fa-eye-slash';
}
function hide() {
    'use strict';
    var p = document.getElementsByClassName('password');
    let i;
    for(i=0; i < p.length; i++) {
        p[i].setAttribute('type', 'password');
    }
    document.getElementById('eye').className = 'fa fa-eye';
}
var isShow = 0;
function showHidePassword() {
    'use strict';
    if (isShow === 0) {
        isShow = 1;
        show();
    } else {
        isShow = 0;
        hide();
    }
}
