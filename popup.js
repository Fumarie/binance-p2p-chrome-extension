document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get('orders', function (value) {
        if (!value || Object.keys(value).length === 0) return;
        console.log(value);

        let crypto_buy = {
            sum: 0,
            volume: 0,
            count: 0
        };

        let crypto_sell = {
            sum: 0,
            volume: 0,
            count: 0
        };

        Object.values(value.orders).forEach((element) => {
            const sum = Number(element.sum.split(",").join(""));
            const volume = Number(element.volume.split(",").join(""));

            //USDT!
            if (element.currency === "/USDT") {
                if (element.type === "Продать") {
                    crypto_sell.sum += sum;
                    crypto_sell.count++;
                    crypto_sell.volume += volume;
                } else {
                    crypto_buy.sum += sum;
                    crypto_buy.count++;
                    crypto_buy.volume += volume;
                }
            }
        });

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

        document.body.insertAdjacentHTML(
            "beforeend",
            `
    <div>Общая сумма покупок USDT: 
      ${crypto_buy.sum}
      (${crypto_buy.count} deals)
    </div>
    <div>
    Средний курс:
    ${buy_rate}
    </div>
    <hr />
    <div>Общая сумма продаж USDT: 
      ${crypto_sell.sum}
      (${crypto_sell.count} deals)
    </div>
    <div>
      Средний курс:
      ${sell_rate}
    </div>
    <hr />
    <div>
    Ожидаемый профит ${expected_profit}(${expected_profit_percent}%)
    <div>
    </div>
    Действительный профит ${profit}
    </div>
    `
        );
    })
})
