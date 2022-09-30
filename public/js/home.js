

$('.tab').click((event) => {
    $('.tab').removeClass('active-tab');
    $($(event.currentTarget)).addClass('active-tab');
})

$('#exit-btn').click(() => {
    window.location.pathname = '/logout';
})