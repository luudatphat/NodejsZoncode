$(function(){
    $(document).on('click', '#login', function(){
        $('.popcompl').attr('style', 'overflow: hidden; display: block;');
    });
});

$(document).ready(function() {
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });
    $('#login_form').on('click','.id_login',function (e) {
        e.preventDefault();
        if($("#login_form").valid()) {
            var username = $('#user_name').val();
            var password = $('#password').val();
            var order_id = $('#order_id_url').val();
            var phone = $('#phone_url').val();
            $.ajax({
                url: 'login',
                dataType: 'json',
                type: 'post',
                contentType: 'application/x-www-form-urlencoded',
                data: {username: username, password: password, order_id: order_id, phone: phone,token:token},
                success: function (data, textStatus, jQxhr) {
                    if (data.status == 1) {
                        window.location = base_url;
                    }
                    else if (data.status == 2) {
                        var url_account=data.data_account;
                        window.location = base_url + data.data_account;
                    }
                    else if (data.status == 3) {
                        var url_account=data.data_account;
                        window.location = base_url + data.data_account;
                    }
                    else if (data.status == 0) {
                        // window.location=base_url;
                        $('.alert-danger').css('display','block');
                        $(".alert-danger").html('アカウントまたはパスワードが正しくありません。 もう一度お試しください！');
                    }
                    else
                    {
                        console.log(data);
                    }
                },
                error: function (jqXhr, textStatus, errorThrown) {
                    $('.alert-danger').css('display','block');
                    $(".alert-danger").html('ユーザー名とパスワードは必須です。パスワードは最小6桁で入力してください。');
                }
            });
        }
    });
});

$(document).ready(function() {
    $("#login_form").validate({
        rules : {
            'username':{required:true},
            'password':{required:true,minlength:6}
        }, tooltip_options: {
        },
        messages: {
            username: "入力してください。",
            password: {
                required: "入力してください。",
                minlength: "少なくとも6文字のパスワード。"
            }
        }
    });
});

$(document).ready(function() {
    $("#forgot_form").validate({
        rules : {
            'username':{required:true,email:true},
        }, tooltip_options: {
        }
    });
});

$('#login_form').on('click','.forgot_password',function (e) {
    e.preventDefault();
    $('#popup_forgot').css('display','block');
});

$('#forgot_form').on('click','.id_fogot',function (e) {
    e.preventDefault();
    if($("#forgot_form").valid()) {
        var username_forgot = $('#user_name_password').val();
        $.ajax({
            url: 'forgot-password',
            dataType: 'json',
            type: 'post',
            contentType: 'application/x-www-form-urlencoded',
            data: {username: username_forgot},
            success: function (data, textStatus, jQxhr) {
                if(data.status==0)
                {
                    $('.alert-danger').css('display','block');
                    $(".alert-danger").html('メールアドレスは存在しておりません。');
                }
                else if (data.status==1)
                {
                    $('.alert-success').css('display','block');
                    $(".alert-success").html('後ほどスタッフより連絡しますので、しばらくお待ち下さい。');
                }
            },
            error: function (jqXhr, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });
    }
});
socket.on('checkLoginClient', function(msg){
    var idUser = $('#idUser').val();
    if (msg==idUser){
        $('#idUser').val("");
        location.reload();
    }

});

