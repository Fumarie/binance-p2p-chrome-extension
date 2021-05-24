document.addEventListener('DOMContentLoaded', popup)

let storageValue = {}

function popup() {
    generateHtml()
    chrome.storage.local.get('orders', function (value) {
        if (!value || Object.keys(value).length === 0) return
        console.log(value)
        storageValue = value
        filterData(value, null, null)
    })
}

function filterData(value, startDate, endDate) {
    console.log('filtering')
    let init_buy = {
        sum: 0,
        volume: 0,
        count: 0
    }

    let init_sell = {
        sum: 0,
        volume: 0,
        count: 0
    }

    let Arr = Array.from(Object.values(value.orders))

    Arr.sort((a, b) => {
        return new Date(b.date) - new Date(a.date)
    })

    if(!startDate) startDate = new Date(Arr[Arr.length - 1].date.split(' ')[0])
    else startDate = new Date(startDate)
    if(!endDate) endDate = new Date(Date.now())
    else endDate = new Date(endDate)

    Arr.forEach((element) => {
        const clearDate = element.date.split(' ')[0]
        const date = new Date(clearDate)
        if (date >= startDate && date <= endDate) {
            const sum = Number(element.sum.split(",").join(""));
            const volume = Number(element.volume.split(",").join(""));

            //USDT!?
            if (element.currency === "/USDT") {
                if (element.type === "Продать") {
                    init_sell.sum += sum;
                    init_sell.count++;
                    init_sell.volume += volume;
                } else {
                    init_buy.sum += sum;
                    init_buy.count++;
                    init_buy.volume += volume;
                }
            }
        }
    })

    const crypto_buy = init_buy
    const crypto_sell = init_sell

    ///
    let buy_rate = 0;
    if (crypto_buy.sum / crypto_buy.volume) {
        buy_rate = (crypto_buy.sum / crypto_buy.volume).toFixed(2);
    }

    let sell_rate = 0;
    if (crypto_sell.sum / crypto_sell.volume) {
        sell_rate = (crypto_sell.sum / crypto_sell.volume).toFixed(2);
    }

    let expected_profit = 0;
    let expected_profit_percent = 0;

    if (crypto_buy.volume && sell_rate && buy_rate) {
        expected_profit =
            crypto_buy.volume * sell_rate - crypto_buy.volume * buy_rate;
        expected_profit_percent =
            (expected_profit / (crypto_buy.volume * sell_rate)) * 100;
    }

    let profit = 0;
    if (crypto_buy.sum && crypto_sell.sum) {
        profit = crypto_sell.sum - crypto_buy.sum;
    }
    insertData(crypto_buy, crypto_sell, buy_rate, sell_rate, expected_profit, expected_profit_percent, profit)
}

function insertData(crypto_buy, crypto_sell, buy_rate, sell_rate, expected_profit, expected_profit_percent, profit) {
    const crypto_buy_sum_p = document.getElementById('crypto-buy-sum')
    crypto_buy_sum_p.innerHTML = `${crypto_buy.sum.toFixed(2)}`
    const crypto_sell_sum_p = document.getElementById('crypto-sell-sum')
    crypto_sell_sum_p.innerHTML = `${crypto_sell.sum.toFixed(2)}`
    const crypto_buy_count_p = document.getElementById('crypto-buy-count')
    crypto_buy_count_p.innerHTML = `(${crypto_buy.count} deals)`
    const crypto_sell_count_p = document.getElementById('crypto-sell-count')
    crypto_sell_count_p.innerHTML = `(${crypto_sell.count} deals)`
    const buy_rate_p = document.getElementById('buy-rate')
    buy_rate_p.innerHTML = `${buy_rate}`
    const sell_rate_p = document.getElementById('sell-rate')
    sell_rate_p.innerHTML = `${sell_rate}`
    const expected_profit_p = document.getElementById('expected-profit')
   expected_profit_p.innerHTML = `${expected_profit.toFixed(2)}`
    const expected_profit_percent_p = document.getElementById('expected-profit-percent')
    expected_profit_percent_p.innerHTML = `${expected_profit_percent.toFixed(2)}`
    const profit_p = document.getElementById('profit')
    profit_p.innerHTML = `${profit.toFixed(2)}`

}

function generateHtml() {
    document.body.insertAdjacentHTML(
        "beforeend",
        `
            <div id="body">
                С: <input type="date" id="from" />
                По: <input type="date" id="since" />
                <hr />
                <div>Общая сумма покупок USDT: 
                  <p id="crypto-buy-sum">0</p>
                  <p id="crypto-buy-count">0</p>
                </div>
                <div>
                Средний курс:
                <p id="buy-rate">0</p>
                </div>
                <hr />
                <div>Общая сумма продаж USDT: 
                  <p id="crypto-sell-sum">0</p>
                  <p id="crypto-sell-count">0</p>
                </div>
                <div>
                  Средний курс:
                  <p id="sell-rate">0</p>
                </div>
                <hr />
                <div>
                Ожидаемый профит <p id="expected-profit">0</p>(<p id="expected-profit-percent">0</p>%)
                <div>
                </div>
                Действительный профит <p id="profit">0</p>
                </div>
            </div>
            `
    )
    const from = document.getElementById('from')
    const since = document.getElementById('since')
    from.addEventListener('input', () => filterData(storageValue, from.value, since.value))
    since.addEventListener('input', () => filterData(storageValue, from.value, since.value))
}