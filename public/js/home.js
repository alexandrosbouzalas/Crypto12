
let defaultTimespan = 7;
let currencies = {
    EUR: '€',
    USD: '$',
    JPY: '¥'
}

let defaultCurrency = 'USD';


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
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ currency: defaultCurrency }),
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
            defaultTimespan = 7;
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
        $(".function-btn, .coin-name-full, .coin-price, .tab-label, #portfolio-btn, #overview-btn").addClass('dark-color');
        $('#form-stacked-select, #settings-popup, #container-main, .tab, .function-btn, .buy-content, .amount-select').addClass('dark-background');

    } else {
        
        $('#color-theme-btn').html('<ion-icon name="sunny-outline"></ion-icon>');

        $('#settings-popup').removeClass('uk-card-secondary');
        $(".function-btn, .coin-name-full, .coin-price, .tab-label, #portfolio-btn, #overview-btn").removeClass('dark-color');
        $('#form-stacked-select, #settings-popup, #container-main, .tab, .function-btn, .buy-content, .amount-select').removeClass('dark-background');
    }
}

const resizeInput = () => {
    if($('.amount-select').val().length !== 0)
       $('.amount-select').width($('.amount-select').val().length + 'ch');
    else
    $('.amount-select').css('width', '40px');

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

        $('.amount-select').val('');
        $('.amount-converted-container p').text('');
        $('.amount-select-container p').text(currencies[defaultCurrency]);

        
        const currentRow = $(event.currentTarget).parents().closest('tr');
        const currentCoinNameShort = currentRow.find('.coin-name-short').text();
        const currentCoinNameFull = currentRow.find('.coin-name-full').text();
        const currentCoinImgPath = currentRow.find('.coin-icon').attr('src');
        const currentCoinPrice = currentRow.children().eq(1).text();
        
        $('.info-buy p').text(currentCoinPrice);
        $('.buy-overlay .coin-icon').attr('src', currentCoinImgPath);
        $('.buy-overlay .coin-name-full').text(currentCoinNameFull);
        $('.buy-overlay .coin-name-short').text(currentCoinNameShort);
        
        $('.amount-converted-container p:nth-of-type(1)').text('0');
        $('.amount-converted-container p:nth-of-type(2)').text(currentCoinNameShort);

        $('#buy-btn-final').text(currentCoinNameShort + ' Kaufen');

    })

    $('#color-theme-btn').click(() => {

        if(localStorage.darkMode === 'true')
            localStorage.setItem('darkMode', false);
        else 
            localStorage.setItem('darkMode', true);

        toggleDarkMode(localStorage.darkMode);
    })

    $('#form-stacked-select').change((e) => {
        defaultCurrency =  $(e.currentTarget).val();

        fetchTickers();
        $('#settings-btn').click();
    })

    $(document).keyup(function(e) {
        if (e.key === "Escape" && $('.buy-overlay').is(':visible')) { 
            $('.buy-overlay').slideUp();
       }
   });

   $(document).click((e) => {
        if (!$(e.target).hasClass('buy-btn') && $('.buy-overlay').css('display') === 'flex' && !$(e.target).parents('div.buy-overlay').length) {
            $('.buy-overlay').slideUp();
        }
   })
   
   $('.amount-select-container input').keyup(() => {resizeInput();})

   $('#switch-btn').click(() => {
    const convertedLabel = $('.amount-converted-container p:nth-of-type(2)').text();
    const inputLabel = $('.amount-select-container p').text();

    if(['$', '¥', '€'].includes(inputLabel)) {
        $('.amount-select-container p').text(convertedLabel)
        $('.amount-converted-container p:nth-of-type(2)').text(inputLabel);
    } else if(['$', '¥', '€'].includes(convertedLabel)){
        $('.amount-select-container p').text(convertedLabel)
        $('.amount-converted-container p:nth-of-type(2)').text(inputLabel);
    }
   })

})

