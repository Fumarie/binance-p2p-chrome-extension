window.setTimeout(newIds, 5000)

const div = document.querySelector('.Table__TableWarp-sc-1fy6eca-0 > table > tbody').childNodes
window.setTimeout(() => {
    const buttonsList = document.querySelector('.Table__TableWarp-sc-1fy6eca-0').childNodes[1].childNodes
    buttonsList.forEach(element => {
        console.log(element)
        element.onclick = function() {
            clearButtons()
            setTimeout(newIds, 2500)
            console.log('event')
        }
        console.log('buttonsList', buttonsList)
    })}, 5000)


function clearButtons() {
    div.forEach((tr, i) => {
        if(i % 2 === 0) return
        const td = tr.childNodes[5] || null
        console.log('TDDDD', td)
        if (td) {
            const myButton = document.getElementById("MyButtonForSync")
            if(myButton)
            td.removeChild(myButton)
        }
    })
}

function newIds() {
    document.body.style.border = "5px solid red";

    chrome.storage.local.get('orders', function (orders) {
        let backendIds = []

        let ids = []

        console.log(orders.orders)
        if (orders.orders) {
            console.log('orders', orders.orders)

            backendIds = Object.keys(orders.orders)
            console.log(Object.keys(orders.orders))
        }
        console.log(backendIds)
        div.forEach((elem, i) => {
            if (i % 2 === 0) {
                const id = elem.firstChild.firstChild.childNodes[2].innerText.toString()
                if (!backendIds.includes(id)) {
                    console.log('WE FIND ID!!!!', id)
                    ids.push(id)
                }
            }
        })
        console.log('newIds: ', ids)
        addButtons(ids)
    })
}

function addButtons(ids) {
    div.forEach((elem, i) => {
        if (i % 2 === 0) {

            ///
            const statusData = elem.nextSibling.childNodes[4]
            if (statusData) {
                const orderStatus = statusData.firstChild.firstChild.innerText
                if (orderStatus !== 'Завершено') return
                console.log(orderStatus)
            }
            ///

            const id = elem.firstChild.firstChild.childNodes[2].innerText.toString()
            console.log('ids', ids)
            console.log(id)
            if (!ids.includes(id)) return


            const td = elem.nextSibling.childNodes[5]
            console.log('td', td)

            const syncButton = document.createElement('button')
            syncButton.innerText = "٩(͡๏̯͡๏)۶"
            syncButton.style.margin = "0px 0px 45px 0px"
            syncButton.onclick = onButtonClick;
            syncButton.id = "MyButtonForSync"

            console.log(syncButton)

            td.appendChild(syncButton)
        }
    })
}

function onButtonClick(event) {
    const row = event.target.parentNode.parentNode

    const sum = row.childNodes[1].firstChild.firstChild.innerText
    const rate = row.childNodes[2].firstChild.firstChild.childNodes[1].firstChild.innerText
    const currency = row.childNodes[2].firstChild.firstChild.childNodes[1].childNodes[1].innerText
    const volume = row.childNodes[2].firstChild.childNodes[1].childNodes[1].firstChild.innerText

    console.log('sum', sum)
    console.log('rate', rate)
    console.log(currency)
    console.log(volume)

    const idRow = row.previousSibling.firstChild.firstChild

    const type = idRow.childNodes[0].innerText
    const id = idRow.childNodes[2].innerText
    const date = idRow.childNodes[3].innerText

    console.log(type, id, date)

    const data = {
        sum,
        rate,
        currency,
        volume,
        type,
        id,
        date
    }
    console.log('-------------------------------------------------------------------')
    try {
        chrome.storage.local.get('orders', function (value) {
            let object = {}
            if (value) {
                console.log('get: ', value)
                object = {...value.orders, [data.id]: {...data}}

                console.log('object', object)
                chrome.storage.local.set({orders: {...object}}, function () {
                        console.log('Saved: ', data)
                    }
                )
            } else {
                chrome.storage.local.set({orders: {[data.id]: {...data}}}, function () {
                        console.log('Saved: ', data)
                    }
                )
            }
        })
    } catch (e) {
        console.log(e)
    }
}


