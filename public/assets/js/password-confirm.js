$('#id_password').on('keyup', function() {
    var a = $("#id_password").val();
    var b = $("#id_confirm_password").val();
    if(a == b && a != ''){
        $("#submit_form").removeAttr('disabled');
        $("#my-hint").replaceWith("<div id='my-hint' style='color:#29a745;'>😊 Match !!!</div>");
        $("#submit_form").removeAttr('title');
    }else {
        $("#submit_form").attr('disabled','disabled');
        $("#my-hint").replaceWith("<div id='my-hint' style='color:red;'>😢 Your Password does not match</div>");
        $("#submit_form").attr('title','filed, confirm password and password should be same');
    }
});
$('#id_confirm_password').on('keyup', function() {
    var a = $("#id_password").val();
    var b = $("#id_confirm_password").val();
    if(a == b && a!=''){
        $("#submit_form").removeAttr('title');
        $("#submit_form").removeAttr('disabled');
        $("#my-hint").replaceWith("<div id='my-hint' style='color:#29a745;'>😊Match !!!</div>");
    }else {
        $("#submit_form").attr('disabled','disabled');
        $("#my-hint").replaceWith("<div id='my-hint' style='color:red;'>😢Your Password does not match</div>");
        $("#submit_form").attr('title','confirm password and password should be same');
    }
});