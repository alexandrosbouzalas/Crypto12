
let defaultTimespan = 7;
let currencies = {
    EUR: '€',
    USD: '$',
    JPY: '¥'
}

let currencyRates;
let currentBuyPrice;
let coinAmountPerDollar;

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
        $(element).find('.coin-price').text((currentCoin.FRR.toString().includes('.') ? parseFloat(currentCoin.FRR.toFixed(5)) : currentCoin.FRR) + " " + currencies[defaultCurrency]);
        $(element).find('.coin-price').attr('title', currentCoin.FRR);

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
            changeCurrency(defaultCurrency, response);
        },
        error: function (err) {
            UIkit.notification({message: 'There was an error fetching crypto data!', status: 'error'}) ;
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

const changeCurrency = (to, cryptoData) => {

    if(to === 'USD') insertDataIntoTable(cryptoData);
    else {
        
        Object.entries(cryptoData).forEach((coin, i) => {
            coin[1].FRR = coin[1].FRR * currencyRates[to];
            coin[1].DAILY_CHANGE_RELATIVE = coin[1].DAILY_CHANGE_RELATIVE * currencyRates[to];
        })
        
        insertDataIntoTable(cryptoData);
    }
}

const resizeInput = () => {
    if($('.amount-select').val().length !== 0)
       $('.amount-select').width($('.amount-select').val().length + 'ch');
    else if($('.amount-select').val().length == 0)
        $('.amount-select').css('width', '40px');

}

const currencyToCoin = () => {

    $('#switch-btn').hasClass('switched') ? $('#converted').text(($('.buy-overlay .amount-select').val() * currentBuyPrice)) : $('#converted').text(($('.buy-overlay .amount-select').val() / currentBuyPrice));
}

toggleDarkMode(localStorage.darkMode);

$(document).ready(() => { 
    
    $.ajax({
        url: "/home/getCurrencyRates",
        method: "GET",
        contentType: "application/json",
        success: function (response) {
            currencyRates = response;
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
            }, 30000);

            const coinSelectionInterval = setInterval(() => {
                switchCoinView();
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

                $('.amount-select').css('width', '40px');
                $('.amount-select').val('');
                $('.amount-converted-container p').text('');
                $('.amount-select-container p').text(currencies[defaultCurrency]);

                
                const currentRow = $(event.currentTarget).parents().closest('tr');
                const currentCoinNameShort = currentRow.find('.coin-name-short').text();
                const currentCoinNameFull = currentRow.find('.coin-name-full').text();
                const currentCoinImgPath = currentRow.find('.coin-icon').attr('src');
                const currentCoinPriceShort = currentRow.children().eq(1).text();
                const currentCoinPriceFull = currentRow.children().eq(1).attr('title');
                
                $('.info-buy p').text(currentCoinPriceShort);
                $('.buy-overlay .coin-icon').attr('src', currentCoinImgPath);
                $('.buy-overlay .coin-name-full').text(currentCoinNameFull);
                $('.buy-overlay .coin-name-short').text(currentCoinNameShort);
                
                $('.amount-converted-container p:nth-of-type(1)').text('0');
                $('.amount-converted-container p:nth-of-type(2)').text(currentCoinNameShort);

                $('#buy-btn-final').text(currentCoinNameShort + ' Kaufen');

                currentBuyPrice = currentCoinPriceFull;

            })

            $('#color-theme-btn').click(() => {

                if(localStorage.darkMode === 'true')
                    localStorage.setItem('darkMode', false);
                else 
                    localStorage.setItem('darkMode', true);

                toggleDarkMode(localStorage.darkMode);
            })

            $('#form-stacked-select').change(() => {
                defaultCurrency =  $('#form-stacked-select').val();      
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
        
        $('.amount-select-container input').on('input', (e) => {
                $(e.target).val($(e.target).val().replace(/[^0-9.]/g, ''));
                resizeInput();
                currencyToCoin();
            })

        $('#switch-btn').click(() => {

            if($('#switch-btn').hasClass('switched')) {
                $('#switch-btn').removeClass('switched')
                //$('.amount-select-container').css('transform', `translateX(${$('.amount-converted-container p:nth-of-type(2)').width()}px)`)
            } else {
                //$('.amount-select-container').css('transform', `translateX(-${$('.amount-converted-container p:nth-of-type(2)').width()}px)`)
                $('#switch-btn').addClass('switched');
            }

            const convertedLabel = $('.amount-converted-container p:nth-of-type(2)').text();
            const inputLabel = $('.amount-select-container p').text();

            if(['$', '¥', '€'].includes(inputLabel)) {
                $('.amount-select-container p').text(convertedLabel)
                $('.amount-converted-container p:nth-of-type(2)').text(inputLabel);
            } else if(['$', '¥', '€'].includes(convertedLabel)){
                $('.amount-select-container p').text(convertedLabel)
                $('.amount-converted-container p:nth-of-type(2)').text(inputLabel);
            }

            currencyToCoin();
        })

        $('#buy-btn-final').click((e) => {
            valid = true;
            if($('.amount-select').val().length > 7) {
                UIkit.notification({message: 'Purchase price can not exceed 9999999!', status: 'warning'});
                valid = false;
            }
            if($('.amount-select').val().length >  0 && !/^[0-9]+$/.test($('.amount-select').val())) {
                UIkit.notification({message: 'Invalid characters in purchase price!', status: 'warning'})
                valid = false;
            }
            
            if($('.amount-select').val().length == 0) valid = false; 

            if(valid) {
                $.ajax({
                    url: "/home/placeOrder",
                    method: "POST",
                    contentType: "application/json",
                    data: JSON.stringify({ amount: amount }),
                    success: function (response) {
                        UIkit.notification({message: 'Order placed successfully!', status: 'success'})
                        $('.buy-overlay').slideUp();
                    },
                    error: function (err) {
                        // Insert error handling here
                        UIkit.notification({message: 'There was an error placing your order!', status: 'error'})
                        console.log(err.statusText)
                    },
                });
            }
        })
        },
        error: function (err) {
            UIkit.notification({message: 'There was an error fetching currency exchange rates!', status: 'error'})
            console.log(err.statusText)
        },
      });
})

