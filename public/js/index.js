$('#register-confirm-btn').click(() => {

    let valid = true;
    
    if(!validateUsername($('#username-register').val())) {
        valid = false; 
        alert('Benutzername muss mindestens 4 Zeichen lang sein!');
    };
    if(!validatePassword($('#password-register').val())) {
        valid = false; 
        alert('Das Passwort muss mindestens 8 Zeichen lang sein!');
    }
    if(!validatePassword($('#password-repeat-register').val())) {
        valid = false; 
        alert('Das Passwort muss mindestens 8 Zeichen lang sein!');
    }
    if($('#password-register').val() !== $('#password-repeat-register').val()) {
        valid = false; 
        alert('Passwörter stimmen nicht überein!');
    }

    if(valid) {

        $.ajax({
            url: "/register",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({ data: {username: $('#username-register').val(), password: $('#password-register').val()} }),
            success: function (response) {
              $('#login-btn').click();
            },
            error: function (err) {
                // Insert error handling here
              console.log('There was an error creating your account')
              console.log(err.responseJSON.msg);
            },
          });
    }
})

$('#login-confirm-btn').click(() => {

    let valid = true;
    
    if(!validateUsername($('#username-login').val())) {
        valid = false; 
        alert('Benutzername muss mindestens 4 Zeichen lang sein!');
    };
    if(!validatePassword($('#password-login').val())) {
        valid = false; 
        alert('Das Passwort muss mindestens 8 Zeichen lang sein!');
    }

    if(valid) {

        $.ajax({
            url: "/login",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({ data: {username: $('#username-login').val(), password: $('#password-login').val()} }),
            success: function (response) {
              window.location.pathname = '/home';
            },
            error: function (err) {
                // Insert error handling here
              console.log('There was an error creating your account')
              console.log(err.responseJSON.msg);
            },
          });
    }
})

const validateUsername = (username) => {
  /* const reUsername =
    /^[a-zA-Z0-9](_(?!(\.|_))|\.(?!(_|\.))|[a-zA-Z0-9]){2,18}[a-zA-Z0-9]$/; */

  if (username.length < 4) return false;
  else return true;
}

const validatePassword = (password) => {
    /* const rePassword =
      /^(?=(.*[a-z]){3,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){2,})(?=(.*[!@#$%^&*()\-__+.]){1,}).{8,}$/; */

    if (password.length < 8)
      return false;
    else return true;
}

