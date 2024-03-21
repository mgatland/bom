const $ = document.querySelector.bind(document)

const accountsPageEl = $('.bom-page-accounts')
const messagesPageEl = $('.bom-page-messages')
const messageAlertEl = $('.bom-message-alert')
const messageAlertCountEl = $('.bom-message-alert-count')
const messageListEl = $('.bom-message-list')
const accountListEl = $('.bom-account-list')
const deleteMessagesEl = $('.bom-delete-messages-button')
const toastEl = $('.bom-toasts')

const client = {}
client.refresh = function () {
  updateMessages()
  updateAccounts()
}

let nextToastId = 0
client.toast = function (message) {
  let newNode = document.createRange().createContextualFragment(
  `<div data-toastid=${nextToastId++} class="border-2 p-2 bg-base-100 rounded-md shadow-xl transition-opacity	duration-500">
  ${message}
  <i class="fa-solid fa-xmark fa-xl ml-6 bom-dismiss-toast"></i>
  </div>`)

  toastEl.appendChild(newNode)

  function hideLater(node) {
    setTimeout(() => {node.classList.add('opacity-0')}, 5000)
    setTimeout(x => node.remove(), 5000 + 750)
  }
  hideLater(toastEl.lastElementChild)
}

toastEl.addEventListener('click', e => {
  if (e.target.classList.contains('bom-dismiss-toast')) {
    e.target.parentElement.classList.add('opacity-0')
    setTimeout(x => e.target.parentElement.remove(), 750)
  }
})

$('.bom-alert-button').addEventListener('click', function(e) {
  showPage(messagesPageEl)
})

$('.bom-home-button').addEventListener('click', function(e) {
  showPage(accountsPageEl)
})

messageListEl.addEventListener('click', function(e) {
  if (e.target.classList.contains('btn') && e.target.dataset.action === 'freeGift') {
    e.target.innerHTML =
    `<span style='color:rgba(0,0,0,0);'>${e.target.innerHTML}</span>`  
    +'<span class="loading loading-spinner absolute"></span>'
    server.userAction(e.target.dataset.action, e.target.dataset.code)
  }
})

deleteMessagesEl.addEventListener('click', function(e) {
  server.deleteMessages()
})

function display(el, displayStatus) {
  el.classList.toggle('hidden', !displayStatus)
}

function showPage(page) {
  client.refresh()
  display(accountsPageEl, accountsPageEl === page)
  display(messagesPageEl, messagesPageEl === page)
}

function updateMessages() {
  const messages = server.getMessages()
  const alertCount = server.getAlertCount()
  log(messages, alertCount)
  display(messageAlertEl, alertCount > 0)
  messageAlertCountEl.innerHTML = alertCount
  let messagesHtml = ''
  let timeAgo = new timeago()
  for (const message of messages) {
    log(message.title)
    messagesHtml += `
  <div class="border-b-2 py-4 mb-4">
    <div class="mx-4 mb-3 text-slate-400">${capitalizeFirstLetter(timeAgo.format(message.date))}</div>
    <div class="mx-4 mb-3">${message.title}</div> 
    <div class="mx-4 mb-3 text-slate-500">${message.text}</div>
    ${message.action ? `<div class="btn btn-primary mx-4 mb-3 ${message.action.type==='disabled' ? 'btn-disabled' : ''}" data-action="${message.action.type}" data-code="${message.action.id}">${message.action.text}</div>` : ``}
  </div>
    `
  }
  if (messages.length === 0) {
    messagesHtml += 
    `<div class="border-b-2 py-4 mb-4">
      <div class="mx-4 text-slate-400">You have no messages.</div>
    </div>`
  }
  messageListEl.innerHTML = messagesHtml
}

function updateAccounts() {
  const accounts = server.getAccounts()
  log(accounts)
  let accountsHtml = ''
  for (const account of accounts) {
    accountsHtml += `
    <div class="flex flex-row justify-between border-b-2 py-4">
      <div class="mx-4 pl-4 border-l-8 border-primary h-10 leading-10">${account.name}</div>
      <div class="px-4 h-10 leading-10 hori">$${cash(account.balance)}</div>
    </div>
    `
  }
  accountListEl.innerHTML = accountsHtml;
}

function cash(num) {
  return Number(num).toFixed(2)
}

function log (...rest) {
  console.log(...rest)
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

server.start(client)
showPage(accountsPageEl)
