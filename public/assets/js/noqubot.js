
function show(){
    'use strict';
    var p = document.getElementById('password');
    p.setAttribute('type', 'text');
    document.getElementById('eye').className = 'fa fa-eye-slash';
}
function hide() {
    'use strict';
    var p = document.getElementById('password');
    p.setAttribute('type', 'password');
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
