import mCreateAccountPage from "./bom-create-account.js"
import mAccountPage from "./bom-account.js"

const $ = document.querySelector.bind(document)
const camelToDashCase = str => str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);

const messageAlertEl = $('.bom-message-alert')
const messageAlertCountEl = $('.bom-message-alert-count')
const messageListEl = $('.bom-message-list')
const accountListEl = $('.bom-account-list')
const deleteMessagesEl = $('.bom-delete-messages-button')
const toastEl = $('.bom-toasts')

const bankPages = []
function addBankPage(name) {
  bankPages[name] = $('.bom-page-' + camelToDashCase(name))
}
['createAccount', 'accounts', 'messages', 'account'].map(addBankPage)

const client = {}
client.refresh = function (parts) {
  if (!parts) {
    updateMessages()
    updateAccounts()
    return
  }
  if (parts.includes('messages')) {
    updateMessages()
  }
  if (parts.includes('accountBalances')) {
    updateAccountBalances()
  }
}

client.showAccounts = () => showPage(bankPages.accounts)

let nextToastId = 0
client.toast = function (message) {
  let newNode = document.createRange().createContextualFragment(
  `<div data-toastid=${nextToastId++} class="border-2 p-2 bg-base-100 rounded-md shadow-xl transition-opacity	duration-500">
  ${message}
  <i class="fa-solid fa-xmark fa-xl ml-6 cursor-pointer bom-dismiss-toast"></i>
  </div>`)

  toastEl.appendChild(newNode)

  function hideLater(node) {
    setTimeout(() => {node.classList.add('opacity-0')}, 5000)
    setTimeout(x => node.remove(), 5000 + 500)
  }
  hideLater(toastEl.lastElementChild)
}

document.addEventListener('click', e => {
  if (e.target.classList.contains('bom-show-accounts')) {
    showPage(bankPages.accounts)
  }
})

toastEl.addEventListener('click', e => {
  if (e.target.classList.contains('bom-dismiss-toast')) {
    e.target.parentElement.classList.add('opacity-0')
    setTimeout(x => e.target.parentElement.remove(), 500)
  }
})

$('.bom-alert-button').addEventListener('click', function(e) {
  showPage(bankPages.messages)
})

$('.bom-home-button').addEventListener('click', function(e) {
  showPage(bankPages.accounts)
})

$('.bom-create-account-button').addEventListener('click', function (e) {
  mCreateAccountPage.refresh()
  showPage(bankPages.createAccount)
})

accountListEl.addEventListener('click', function(e) {
  const viewAccountEl = e.target.closest('.bom-view-account')
  if (viewAccountEl) {
    mAccountPage.show(parseInt(viewAccountEl.dataset.accountNum))
    showPage(bankPages.account)
  }
})

messageListEl.addEventListener('click', function(e) {
  if (e.target.classList.contains('btn') && e.target.dataset.action === 'freeGift') {
    server.userAction(e.target.dataset.action, e.target.dataset.code)
  }
})

deleteMessagesEl.addEventListener('click', function(e) {
  server.deleteMessages()
})

function display(el, displayStatus) {
  el.classList.toggle('hidden', !displayStatus)
}

// hide other pages and show the given page
function showPage(newPage) {
  client.refresh()
  const showPage = aPage => display(aPage, aPage == newPage)
  Object.entries(bankPages).forEach(([, value]) => showPage(value))
}

function updateMessages() {
  const messages = server.getMessages()
  const alertCount = server.getAlertCount()
  display(messageAlertEl, alertCount > 0)
  messageAlertCountEl.innerHTML = alertCount
  let messagesHtml = ''
  let timeAgo = new timeago()
  for (const message of messages) {
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

function updateHtml(el, newHTML) {
  if (el.innerHTML != newHTML) {
    el.innerHTML = newHTML
  }
}

function updateAccountBalances() {
  //super hacks. Lots of duplicate and strongly coupled code with method below.
  const accounts = server.getAccounts()
  let n = 0
  for (const account of accounts) {
      updateHtml(accountListEl.querySelector('.bom-acc-bal-' + n), `$${cash(account.balance)}`)
    if (account.type === 'term investment') {
      updateHtml(accountListEl.querySelector('.bom-acc-int-' + n), `Interest: $${cash(account.balance * account.interestRate)}`)
    }
    n++
  }
}

function updateAccounts() {
  const accounts = server.getAccounts()
  let accountsHtml = ''
  let n = 0
  for (const account of accounts) {
    if (account.type === 'term investment') {
      accountsHtml += `
      <div class="flex flex-row border-b-2 py-4 items-center bom-view-account cursor-pointer" data-account-num="${n}">
        <div class="ml-4 pl-4 border-l-8 border-secondary h-10 leading-10 my-auto"></div>
        <div class="pr-4 flex flex-col">
          <div>${account.name}</div>
          <div class="text-slate-400">Locked until ${account.endDate.toLocaleDateString("en-NZ")}</div>
        </div>
        <div class="flex-1"></div>
        <div class="pl-4 pr-2 bom-acc-int-${n}">Interest: $${cash(account.balance * account.interestRate)}</div>
        <div class="pr-4 loading loading-ring loading-md"></div>
        <div class="px-4 text-slate-400 bom-acc-bal-${n}">$${cash(account.balance)}</div>
      </div>
      `
    } else {
      accountsHtml += `
      <div class="flex flex-row justify-between border-b-2 py-4 bom-view-account cursor-pointer" data-account-num="${n}">
        <div class="mx-4 pl-4 border-l-8 border-primary h-10 leading-10">${account.name}</div>
        <div class="px-4 h-10 leading-10 hori bom-acc-bal-${n}">$${cash(account.balance)}</div>
      </div>
      `
    }
    n++
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
mCreateAccountPage.setup(bankPages.createAccount, server)
mAccountPage.setup(bankPages.account, server)
showPage(bankPages.accounts)