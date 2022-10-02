

$('.tab').click((event) => {
    $('.tab').removeClass('active-tab');
    $($(event.currentTarget)).addClass('active-tab');
})

$('#exit-btn').click(() => {
    window.location.pathname = '/logout';
})

const insertDataIntoTable = CData => {

    $('.crypto-data-container tbody tr').each((i, element) => {
        let currentCoin = Object.entries(CData)[i][1];
        $(element).find('.coin-price').text(currentCoin.FRR + '$')

        let change = calculateChange(currentCoin.DAILY_CHANGE_RELATIVE, currentCoin.FRR);
        $(element).find('.coin-fluctuation').text(change.value).addClass(change.status);
    })
}

const fetchTickers = () => {
    $.ajax({
        url: "/home/fetchCData",
        method: "GET",
        contentType: "application/json",
        success: function (response) {
          insertDataIntoTable(response);
        },
        error: function (err) {
            // Insert error handling here
          console.log(err.statusText)
        },
      });
}

const fetchCoinHistory = (coin) => {
    $.ajax({
        url: "/home/fetchCDataHistory",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ coin: coin }),
        success: function (response) {
            prepareChartSingleCurrency(response);
        },
        error: function (err) {
            // Insert error handling here
          console.log(err.statusText)
        },
      });
}

const prepareChartSingleCurrency = (JSONCHData) => {
    
}

const calculateChange = (priceYesterday, priceCurrent) => {

    if (priceYesterday > priceCurrent)
        return {value: "-" + (100 * Math.abs((priceYesterday - priceCurrent) / ((priceYesterday + priceCurrent) / 2))).toFixed(2).toString() + "%", status: 'down'}

    return {value: (100 * Math.abs((priceYesterday - priceCurrent) / ((priceYesterday + priceCurrent) / 2))).toFixed(2).toString() + "%", status: 'up'}

}

$(document).ready(() => {
    fetchTickers();

    setInterval(() => {
        fetchTickers();
    }, 10000)
})

