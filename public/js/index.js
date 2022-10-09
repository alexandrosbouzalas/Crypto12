$('#register-confirm-btn').click(() => {

    let valid = true;
    
    if(!validateUsername($('#username-register').val())) {
        valid = false; 
        UIkit.notification({message: 'Username must be at least 4 characters long!', status: 'warning'});
      };
      if(!validatePassword($('#password-register').val())) {
        valid = false; 
        UIkit.notification({message: 'The password must be at least 8 characters long!', status: 'warning'});
      }
      if(!validatePassword($('#password-repeat-register').val())) {
        valid = false; 
        UIkit.notification({message: 'The password repeat field must be filled!', status: 'warning'});
      }
      if($('#password-register').val() !== $('#password-repeat-register').val()) {
        valid = false; 
        UIkit.notification({message: 'Passwords do not match!', status: 'warning'});
      }
      
      if(valid) {
        
        $.ajax({
          url: "/register",
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify({ data: {username: $('#username-register').val(), password: $('#password-register').val()} }),
          success: function (response) {
            UIkit.notification({message: 'Your account was created successfully!', status: 'success'});
            $('#login-btn').click();
          },
          error: function (err) {
            // Insert error handling here
            UIkit.notification({message: 'There was an error creating your account. Please try again later.', status: 'danger'});
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
        UIkit.notification({message: 'Username must be at least 4 characters long', status: 'warning'});
      };
      if(!validatePassword($('#password-login').val())) {
        valid = false; 
        UIkit.notification({message: 'The password must be at least 8 characters long!', status: 'warning'});
    }

    if(valid) {

        $.ajax({
            url: "/login",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({ data: {username: $('#username-login').val(), password: $('#password-login').val()} }),
            success: function (response) {
              UIkit.notification({message: 'span uk-icon=\'icon: check\'></span> Logging in...', status: 'success'});
              window.location.pathname = '/home';
            },
            error: function (err) {
                // Insert error handling here
              UIkit.notification({message: 'Invalid username or password!', status: 'danger'});

              console.log('There was an error logging in')
              console.log(err.responseJSON.msg);
            },
          });
    }
})

const toggleDarkMode = (darkMode) => {
  if(darkMode == 'true') {

      $('#color-theme-btn').html('<ion-icon name="moon-outline"></ion-icon>')

      $('#color-theme-btn').addClass('dark-background');
      $('#container-main').addClass('dark-background');
      $('#color-theme-btn').addClass('dark-color');
      $('#container-main > h1').addClass('dark-color');

    } else {
      
      $('#color-theme-btn').html('<ion-icon name="sunny-outline"></ion-icon>');
      
      $('#color-theme-btn').removeClass('dark-background');
      $('#container-main').removeClass('dark-background');
      $('#color-theme-btn').removeClass('dark-color');
      $('#container-main > h1').removeClass('dark-color');
  }
}

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

toggleDarkMode(localStorage.darkMode);


$(document).ready(() => {
  $('#color-theme-btn').click(() => {

    if(localStorage.darkMode === 'true')
        localStorage.setItem('darkMode', false);
    else 
        localStorage.setItem('darkMode', true);

    toggleDarkMode(localStorage.darkMode);
  })
})