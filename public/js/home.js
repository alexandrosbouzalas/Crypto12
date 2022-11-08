
let defaultTimespan = 7;
let currencies = {
    EUR: '€',
    USD: '$',
    JPY: '¥'
}

let currencyRates;
let currentBuyPrice;
let coinAmountPerDollar;
let coinData; 
let portfolioData;
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
            coinData = response; 
        },
        error: function (err) {
            UIkit.notification({message: 'There was an error fetching crypto data!', status: 'danger'}) ;
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
        $(".function-btn, #portfolio-value, .coin-name-full, .coin-price, .tab-label, #portfolio-btn, #overview-btn").addClass('dark-color');
        $('#form-stacked-select, #settings-popup, #container-main, .tab, .function-btn, .buy-content, .amount-select').addClass('dark-background');

    } else {
        
        $('#color-theme-btn').html('<ion-icon name="sunny-outline"></ion-icon>');

        $('#settings-popup').removeClass('uk-card-secondary');
        $(".function-btn, #portfolio-value, .coin-name-full, .coin-price, .tab-label, #portfolio-btn, #overview-btn").removeClass('dark-color');
        $('#form-stacked-select, #settings-popup, #container-main, .tab, .function-btn, .buy-content, .amount-select').removeClass('dark-background');
    }
}

const getUserOrders = () => {

    $.ajax({
        url: "/home/getUserOrders",
        method: "GET",
        contentType: "application/json",
        success: (response) => {
            console.table(response)
        },
        error: (error) => {
            console.log(error)
            UIkit.notification({message: 'There was an error fetching user orders', status: 'danger'})
        }
    })

}

const getUserCryptoData = () => {
    $('#portfolio-tab h1').remove();

    $.ajax({
        url: "/home/getUserCryptoData",
        method: "GET",
        contentType: "application/json",
        success: (response) => {

            if(Object.keys(response).length > 0) {

                let chartStatus = Chart.getChart("coinchart");
                if (chartStatus != undefined) {
                  chartStatus.destroy();
                }
    
    
                const coincolors = {
                    BTC: '#f7931a',
                    ETH: '#627eea',
                    SHIB: '#1c2951',
                    DOGE: '#c3a634',
                    MATIC: '#8247e5',
                    LTC: '#a5a8a9',
                    XMR: '#ff6600',
                    ADA: '#0033ad',
                    DOT: '#e6007a',
                    SOL: '#35c8ba'
                }
    
                const labels = [];
                const coindata = [];
                const colors = [];
                

                Object.entries(response).forEach((c , i) => {
                    labels.push(c[0]);
                    colors.push(coincolors[c[0]])
                    coindata.push(c[1].cAmount);
                })
    
                const data = {
                    labels: labels,
                    datasets: [{
                      backgroundColor: colors,
                      data: coindata,
                      borderRadius: 7,
                      borderSkipped: false,
                      pointRadius: 6,
                      pointHoverRadius: 7
                    }],
                  };
                  
                const config = {
                type: 'pie',
                data: data,
                options: {
                    responsive:true,
                    maintainAspectRatio: false,
                    plugins: {  
                        legend: {
                            labels: {
                            color: "white",  
                            font: {
                                size: 12
                            }
                            }
                        }
                        },
                }
                };

                const coinchart = new Chart(
                $('#coinchart'),
                config
                );
            
                let currentValueAllCoins = 0;
                portfolioData = response;

                Object.entries(response).forEach((c , i) => {
                    currentValueAllCoins += coinData[c[0]].FRR * c[1].cAmount;
                })

                $('#portfolio-value').text(currentValueAllCoins.toFixed(4) + ' ' + currencies[defaultCurrency]);


            } else {
                $('#portfolio-tab h1').remove();
                $('.chart-container').before('<h1 style="color: white">No data found</h1>')
            }

        },
        error: (error) => {
            console.log(error)
            UIkit.notification({message: 'There was an error fetching user portfolio', status: 'danger'})
        }
    })
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

const updatePortfolioValue = (legendItemRemoved, strikethrough) => {
    if(strikethrough && legendItemRemoved)
        $("#portfolio-value").text((parseFloat($("#portfolio-value").text().substr(0, $("#portfolio-value").text().length - 2)) - (coinData[legendItemRemoved.text].FRR * portfolioData[legendItemRemoved.text].cAmount)).toFixed(4) + ' ' + currencies[defaultCurrency]);
    else 
        $("#portfolio-value").text((parseFloat($("#portfolio-value").text().substr(0, $("#portfolio-value").text().length - 2)) + (coinData[legendItemRemoved.text].FRR * portfolioData[legendItemRemoved.text].cAmount)).toFixed(4) + ' ' + currencies[defaultCurrency]);

}

const resizeInput = () => {
    if($('.amount-select').val().length !== 0)
       $('.amount-select').width($('.amount-select').val().length + 'ch');
    else if($('.amount-select').val().length == 0)
        $('.amount-select').css('width', '40px');

}

const currencyToCoin = () => {

    if($('.amount-select').val() !== '.')
        $('#switch-btn').hasClass('switched') ? $('#converted').text(($('.buy-overlay .amount-select').val() * currentBuyPrice)) : $('#converted').text(($('.buy-overlay .amount-select').val() / currentBuyPrice));
}

const enableBuyBtnFinal = () => {

    $('#buy-btn-final').click((e) => {
            
        $('#buy-btn-final').text('Kauf bestätigen?');

        $('#buy-btn-final').addClass('pulse preconfirmed');

        $('.preconfirmed').click((e) => {

            valid = true;

            let price;

            $('#switch-btn').hasClass('switched') ? price = $('#converted').text() : price = $('.amount-select').val();
            !$('#switch-btn').hasClass('switched') ? amount = $('#converted').text() : amount = $('.amount-select').val();

            if(price > 999999) {
                UIkit.notification({message: 'Purchase price can not exceed 999999!', status: 'warning'});
                valid = false;
            }

            if($('.amount-select').val().length >  0 && /[^0-9.]$/.test($('.amount-select').val())) {
                UIkit.notification({message: 'Purchase price contains invalid characters!', status: 'warning'});
                valid = false;
            }

            if($('.amount-select').val()[0] === '.') {
                $('.amount-select').val('0' + $('.amount-select').val());
                $('.amount-select').width($('.amount-select').val().length + 'ch');
                valid = false;
            }

            if($('.amount-select').val()[$('.amount-select').val().length - 1] === '.') {
                $('.amount-select').val($('.amount-select').val() + '0');
                $('.amount-select').width($('.amount-select').val().length + 'ch');
                valid = false;
            }
            
            if($('.amount-select').val().length == 0) valid = false; 

            if($('.amount-select').val().length > 0 && !/[^0-9.]$/.test($('.amount-select').val())) {
                $('.amount-select').val(parseFloat($('.amount-select').val()));
                $('.amount-select').width($('.amount-select').val().length + 'ch');
            }

            if(valid) {
                $.ajax({
                    url: "/home/placeOrder",
                    method: "POST",
                    contentType: "application/json",
                    data: JSON.stringify({data: { coin: $('.buy-overlay .coin-name-short').text(), price: price, amount: amount, currency: defaultCurrency}}),
                    success: function (response) {
                        UIkit.notification({message: 'Order placed successfully!', status: 'success'})
                        $('.buy-overlay').slideUp();
                    },
                    error: function (err) {
                        // Insert error handling here
                        UIkit.notification({message: 'There was an error placing your order!', status: 'danger'})
                        console.log(err.statusText)
                    },
                });
            }

        })

    })

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

                $('#switch-btn').removeClass('switched');
                $('#buy-btn-final').removeClass('pulse preconfirmed');

                $('#buy-btn-final').addClass('disabled');

                $('#buy-btn-final').off();    
                
                enableBuyBtnFinal();

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

            $('#portfolio-btn').click(() => {
                $('.selected-tab').removeClass('selected-tab');
                $('#portfolio-btn').addClass('selected-tab');
                $('#overview-tab').removeClass('visible').addClass('hidden');
                $('#portfolio-tab').removeClass('hidden').addClass('visible');

                getUserCryptoData();

            })

            $('#overview-btn').click(() => {
                $('.selected-tab').removeClass('selected-tab');
                $('#overview-btn').addClass('selected-tab');
                $('#portfolio-tab').removeClass('visible').addClass('hidden');
                $('#overview-tab').removeClass('hidden').addClass('visible');

                fetchTickers();
            })

            $('#form-stacked-select').change(() => {
                defaultCurrency =  $('#form-stacked-select').val();
                if($('#overview-btn').hasClass("selected-tab"))      
                    fetchTickers();
                else 
                    getUserCryptoData();
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

            if($('.amount-select').val().length > 0) {
                $('#buy-btn-final').removeClass('disabled');
                $(e.target).val($(e.target).val().replace(/[^\d\.]/g, '')
                .replace('.', '%FD%') 
                .replace(/\./g, '') 
                .replace('%FD%', '.')) 
                resizeInput();
            } else {
                $('#buy-btn-final').removeClass('pulse preconfirmed');
                $('#buy-btn-final').text($('.buy-overlay .coin-name-short').text() + ' Kaufen');
                $('#buy-btn-final').addClass('disabled');
                $('#buy-btn-final').off();
                enableBuyBtnFinal();
            }
            currencyToCoin();
        })

        $('#switch-btn').click(() => {

            if($('#switch-btn').hasClass('switched')) {
                $('#switch-btn').removeClass('switched')
            } else {
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

        enableBuyBtnFinal();

      },
      error: function (err) {
          UIkit.notification({message: 'There was an error fetching currency exchange rates!', status: 'danger'})
          console.log(err.statusText)
      },
    });
})

