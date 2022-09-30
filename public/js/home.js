

$('.tab').click((event) => {
    $('.tab').removeClass('active-tab');
    $($(event.currentTarget)).addClass('active-tab');
})

$('#exit-btn').click(() => {
    window.location.pathname = '/logout';
})

const fetchCryptoData = () => {
    $.ajax({
        url: "https://rest.coinapi.io/v1/assets",
        method: "GET",
        contentType: "application/json",
        headers: {'X-CoinAPI-Key': 'FECE57DA-544D-425B-92E5-DDA3AC296063'},
        success: function (response) {
          console.log(response)
        },
        error: function (err) {
            // Insert error handling here
          console.log(err.responseJSON.error)
        },
      });
}