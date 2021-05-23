
window.onload = () => {
    start()
}

function start() {
    const tableDiv = document.querySelector(".Table__TableWarp-sc-1fy6eca-0")
    const config = { attributes: true, childList: true, subtree: true }

    const observer = new MutationObserver(function(mutationsList, observer) {
        observer.disconnect()
        setTimeout(() => {
            clearButtons()
            newIds()
            setTimeout(() => {
                    observer.observe(tableDiv, config)
            }, 50)
        }, 500)
        console.log('Observer worked')
    })

    observer.observe(tableDiv, config)
}

function clearButtons() {
    const div = document.querySelector('.Table__TableWarp-sc-1fy6eca-0 > table > tbody').childNodes
    div.forEach((tr, i) => {
        if (i % 2 === 0) return
        const td = tr.childNodes[5] || null
        if (td.childNodes.length) {
            const myButton = document.getElementById("MyButtonForSync")
            if (myButton)
                td.removeChild(myButton)
        }
    })
}

function newIds() {
    const div = document.querySelector('.Table__TableWarp-sc-1fy6eca-0 > table > tbody').childNodes
    const indicator = document.createElement("div")
    indicator.style.cssText = "position:absolute; z-index: 99999; left: 0; top: 0;"
    indicator.background = "#000"
    indicator.innerHTML =  " 🙂"
    document.body.appendChild(indicator)

    chrome.storage.local.get('orders', function (orders) {
        let backendIds = []
        let newIds = []
        let oldIds = []

        if (orders.orders) {
            backendIds = Object.keys(orders.orders)
        }
        div.forEach((elem, i) => {
            if (i % 2 === 0) {
                const id = elem.firstChild.firstChild.childNodes[2].innerText.toString()
                if (!backendIds.includes(id)) {
                    newIds.push(id)
                } else {
                    oldIds.push(id)
                }
            }
        })
        addButtons(newIds, oldIds)
    })
}

function addButtons(ids, oldIds) {
    const div = document.querySelector('.Table__TableWarp-sc-1fy6eca-0 > table > tbody').childNodes
    div.forEach((elem, i) => {
        if (i % 2 === 0) {

            ///
            const statusData = elem.nextSibling.childNodes[4]
            if (statusData) {
                const orderStatus = statusData.firstChild.firstChild.innerText
                if (orderStatus !== 'Завершено') return
            }
            ///

            const id = elem.firstChild.firstChild.childNodes[2].innerText.toString()
            const td = elem.nextSibling.childNodes[5]

            const syncButton = document.createElement('button')
            syncButton.style.margin = "0px 0px 45px 0px"
            syncButton.id = "MyButtonForSync"

            if(ids.includes(id)) {
                syncButton.innerText = "🔃"
                syncButton.onclick = onButtonClick;

            } else if (oldIds.includes(id)){
                syncButton.color = "red"
                syncButton.innerText = "✖"
                syncButton.onclick = function (event) {
                    onRemoveOrder(event, id)
                }
            }
            td.appendChild(syncButton)
        }
    })
}


const onRemoveOrder = (event, id) => {
    chrome.storage.local.get('orders', function (value) {
        const orders = value.orders
        delete orders[id]
        chrome.storage.local.set({orders: orders}, function () {
            const syncButton = event.target
            syncButton.innerText = "🔃"
            syncButton.onclick = onButtonClick;
            }
        )
    })
}

function onButtonClick(event) {
    const row = event.target.parentNode.parentNode

    const sum = row.childNodes[1].firstChild.firstChild.innerText
    const rate = row.childNodes[2].firstChild.firstChild.childNodes[1].firstChild.innerText
    const currency = row.childNodes[2].firstChild.firstChild.childNodes[1].childNodes[1].innerText
    const volume = row.childNodes[2].firstChild.childNodes[1].childNodes[1].firstChild.innerText

    const idRow = row.previousSibling.firstChild.firstChild

    const type = idRow.childNodes[0].innerText
    const id = idRow.childNodes[2].innerText
    const date = idRow.childNodes[3].innerText

    const data = {
        sum,
        rate,
        currency,
        volume,
        type,
        id,
        date
    }
    try {
        chrome.storage.local.get('orders', function (value) {
            let object = {}
            if (value) {
                // console.log('get: ', value)
                object = {...value.orders, [data.id]: {...data}}

                // console.log('object', object)
                chrome.storage.local.set({orders: {...object}}, function () {
                        // console.log('Saved: ', data)
                    }
                )
            } else {
                chrome.storage.local.set({orders: {[data.id]: {...data}}}, function () {
                        // console.log('Saved: ', data)
                    }
                )
            }

            //Замена кнопки на remove
            const button = event.target
            button.color = "red"
            button.innerText = "✖"
            button.onclick = function (event) {
                onRemoveOrder(event, id)
            }

        })
    } catch (e) {
        console.log(e)
    }
}


