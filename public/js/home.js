
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

const fetchCoinHistory = (coin) => {
    $.ajax({
        url: "/home/fetchCDataHistory",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ coin: coin }),
        success: function (response) {
            console.log(response);
        },
        error: function (err) {
            // Insert error handling here
          console.log(err.statusText)
        },
      });
}


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

const toggleDarkMode = (darkMode) => {
    if(darkMode == 'true') {

        $('#color-theme-btn').html('<ion-icon name="moon-outline"></ion-icon>')

        $('#settings-popup').addClass('uk-card-secondary');
        $('#container-main, .tab').addClass('dark-background');
        $(".coin-name-full, .coin-price, .tab-label").addClass('dark-color');
        $('.function-btn').addClass('dark-background dark-color');
    } else {
        
        $('#color-theme-btn').html('<ion-icon name="sunny-outline"></ion-icon>');

        $('#settings-popup').removeClass('uk-card-secondary');
        $('#container-main, .tab').removeClass('dark-background');
        $(".coin-name-full, .coin-price, .tab-label").removeClass('dark-color');
        $('.function-btn').removeClass('dark-background dark-color');
    }
}

const limit = (element) => {
    var max_chars = 7;

    if(element.value.length > max_chars) {
        element.value = element.value.substr(0, max_chars);
    }
}

const resizeInput = (e) => {
    if($(e.currentTarget).val().length !== 0)
       $(e.currentTarget).width($(e.currentTarget).val().length + 'ch');
}

toggleDarkMode(localStorage.darkMode);

$(document).ready(() => {    
    fetchTickers();

    CryptoCharts.priceHistory({
        chart_id: "chart",
        cryptocompare_tickers: ['BTC'],
        axes: true,
        last_days: 7,
        loading_indicator: true,
        options: {
            colors: ["#025dff"]
        }
      });  

    setInterval(() => {
      fetchTickers();
    }, 10000);

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
        $('.buy-overlay').slideDown({
            start: function () {
                $(this).css({
                  display: "flex"
                })
              }
        });

        const currentRow = $(event.currentTarget).parents().closest('tr');
        const currentCoinNameShort = currentRow.find('.coin-name-short').text();
        const currentCoinNameFull = currentRow.find('.coin-name-full').text();
        const currentCoinImgPath = currentRow.find('.coin-icon').attr('src');
        const currentCoinPrice = currentRow.children().eq(1).text();

        $('.info-buy p').text(currentCoinPrice);
        $('.buy-overlay .coin-icon').attr('src', currentCoinImgPath);
        $('.buy-overlay .coin-name-full').text(currentCoinNameFull);
        $('.buy-overlay .coin-name-short').text(currentCoinNameShort);

    })

    $('#color-theme-btn').click(() => {

        if(localStorage.darkMode === 'true')
            localStorage.setItem('darkMode', false);
        else 
            localStorage.setItem('darkMode', true);

        toggleDarkMode(localStorage.darkMode);
    })

    $(document).keyup(function(e) {
        if (e.key === "Escape" && $('.buy-overlay').is(':visible')) { 
            $('.buy-overlay').slideUp();
       }
   });
   
   $('.amount-select-container input').keyup((e) => {resizeInput(e);})

})

