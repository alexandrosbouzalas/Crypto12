
let defaultTimespan = 7;


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
/* 
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
*/

const changeDefaultTimespan = () => {

    const selectedTimespan = $('.active-tspan').children().text();
    switch (selectedTimespan) {
        case '1T':
            defaultTimespan = 2;
            break;
        case '1M':
            defaultTimespan = 30;
            break;
        case '1J':
            defaultTimespan = 365;
            break;
        default: 
            break;
    }
    
}

const prepareChartSingleCurrency = (coinLabel) => {

    CryptoCharts.priceHistory({
        chart_id: "chart",
        cryptocompare_tickers: [coinLabel ? coinLabel : $('tr.focused').find('.coin-name-short').text()],
        axes: true,
        last_days: defaultTimespan,
        loading_indicator: true,
        options: {colors: ["#025dff"]}
      });
} 

const calculateChange = (priceYesterday, priceCurrent) => {

    if (priceYesterday > priceCurrent)
        return {value: "-" + (100 * Math.abs((priceYesterday - priceCurrent) / ((priceYesterday + priceCurrent) / 2))).toFixed(2).toString() + "%", status: 'down'}

    return {value: (100 * Math.abs((priceYesterday - priceCurrent) / ((priceYesterday + priceCurrent) / 2))).toFixed(2).toString() + "%", status: 'up'}

}

const switchCoinView = () => {

    if($('tr.focused').next().length == 0)
        $('tbody tr').removeClass('focused').first().addClass('focused');
    else
        $('tr.focused').removeClass('focused').next().addClass('focused');

    const coinLabel = $('tr.focused').find('.coin-name-short').text();

    prepareChartSingleCurrency(coinLabel);
    
}



const toggleDarkMode = () => {
    $('#container-main, .tab').addClass('dark-background');
    $(".coin-name-full, .coin-price, .tab-label").addClass('dark-color');
    $('#exit-btn').addClass('dark-background dark-color');
}

toggleDarkMode();

$(document).ready(() => {    
    fetchTickers();

    CryptoCharts.priceHistory({
        chart_id: "chart",
        cryptocompare_tickers: ['BTC'],
        axes: true,
        last_days: 7,
        loading_indicator: true,
        options: {colors: ["#025dff"]}
      });  

    const coinSelectionInterval = setInterval(() => {
        switchCoinView();
        fetchTickers();
    }, 10000)


    $('.timespan-select').click((event) => {
        $('.timespan-select').removeClass('active-tspan');
        $(event.currentTarget).addClass('active-tspan');
        changeDefaultTimespan();
        prepareChartSingleCurrency();
    })

    $('tbody tr').click((event) => {
        if(!$(event.target).is('button')) {
            clearInterval(coinSelectionInterval);
            $('tr').removeClass();
            $(event.currentTarget).addClass('user-selected-row focused');
            prepareChartSingleCurrency();
        }
    })

    $('.buy-btn').click((event) => {
        alert('test');
    })

})

