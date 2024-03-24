const user = {}
const state = {user, frame:0}
window.cheats = true

// API
const server = {}

{
  let client = null

  const freeGiftText = `Collect welcome gift`

  function cash(num) {
    return Number(num).toFixed(2)
  }

  function setupNewUser() {
    user.messages = []
    user.unclaimedGifts = []
    user.freeGiftNumber = 0
    user.accounts = []
    user.accounts[0] = {
      name: 'Everyday',
      type: 'everyday',
      balance: 0,
      txns: []
    }
    transaction(user.accounts[0], 0, 'Opening balance')
    user.emptyInboxTime = 4 // hack to more quickly trigger the welcome email
    user.events = {}
    if (window.cheats) {
      giveMoney(300)
      server.createAccount('term investment', 'Term Investment', 150, 0) 
    }
  }

  function createWelcomeMessage() {
    user.freeGiftNumber++
    user.unclaimedGifts.push(user.freeGiftNumber)
    return {
      read: false,
      date: new Date(),
      title: `A welcome gift for you!`,
      text: `Dear &lt;user_with_no_messages&gt;,<br><br>Welcome to Bank of Matthew, the new financial system that's Better than Bitcoin. As a thank you for joining us on this journey, we'd like to send you 100 Coins of Matthew as a welcome gift.`,
      action: {type:'freeGift', 
        id:user.freeGiftNumber,
        text:freeGiftText},
      id: `free-gift-${user.freeGiftNumber}`
    }
  }

  server.MINIMUM_NEW_ACCOUNT_BALANCE = 150

  server.getMessages = function () {
    return user.messages
  }

  server.getAccounts = function () {
    return user.accounts
  }

  server.getAlertCount = () => user.messages.filter(m => m.read === false).length

  server.userAction = function (action, code) {
    if (action === 'freeGift') {
      const num = parseInt(code)
      if (user.unclaimedGifts.includes(num)) {
        user.unclaimedGifts.splice(user.unclaimedGifts.indexOf(num), 1)
        addEvent(3, {type:'freeGiftRecieved',id:code})
        // put a loading spinner in the email
        const message = user.messages.find(x => x.id = 'free-gift-' + code)
        if (message) {
          message.action.text = 
          `<span style='color:rgba(0,0,0,0);'>${freeGiftText}</span>`  
          +`<span class="loading loading-spinner absolute"></span>`
          message.read = true
        }
        client.refresh()
      }
    }
  }

  server.deleteMessages = function () {
    user.messages.length = 0
    client.refresh()
  }

  function addEvent(time, event) {
    if (time === 0) error("don't add events to current frame")
    const frame = state.frame + time
    if (!user.events[frame]) {
      user.events[frame] = []
    }
    user.events[frame].push(event)
  }

  function datesMatch(oldDate, newDate) {
    const cleanOld = new Date(oldDate)
    const cleanNew = new Date(newDate)
    cleanOld.setSeconds(0)
    cleanOld.setMilliseconds(0)
    cleanNew.setSeconds(0)
    cleanNew.setMilliseconds(0)
    return cleanOld.getTime() === cleanNew.getTime()
  }

  function transaction(account, amount, message) {
    account.balance += amount

    // special handling for rapidly repeated payments
    const date = new Date();
    const lastTxn = account.txns.slice(-1)[0]
    if (lastTxn && lastTxn.amount === amount && lastTxn.message === message && datesMatch(lastTxn.date, date)) {
      lastTxn.date = date
      lastTxn.multiplier = lastTxn.multiplier + 1 || 2 
      return
    }

    account.txns.push({
      amount: amount,
      message: message,
      balance: account.balance,
      date: date
      //multiplier
    })
  }

  function giveMoney(amount) {
    const account = user.accounts[0]
    transaction(account, amount, 'BOM Welcome Gift')
    toast(`Your ${account.name} account balance is now $${cash(account.balance)}`)
  }

  function toast(message) {
    //toasts are transient and not persisted
    client.toast(message)
  }

  function tick() {
    state.frame = (state.frame + 1 % (60 * 60))
    let dirty = []
    if (user.messages.length == 0) {
      user.emptyInboxTime++
      if (user.emptyInboxTime >= 5) {
        user.messages.push(createWelcomeMessage())
        user.emptyInboxTime = 0
        dirty.push('messages')
      }
    }
    for (const event of (user.events[state.frame] || [])) {
      if (event.type === 'freeGiftRecieved') {
        giveMoney(100)
        const message = user.messages.find(x => x.id = 'free-gift-' + event.id)
        if (message) {
          message.action.text =
          `<span style='color:rgba(0,0,0,0);'>${freeGiftText}</span>`  
          +`<span class="absolute text-slate-600">Done! <i class="fa-solid fa-sack-dollar fa-xl"></i></span>`
          message.action.type = 'disabled'
        }
        dirty.push('messages')
        dirty.push('accountBalances')
      }
    }
    for (const account of user.accounts) {
      if (account.type === 'term investment') {
        const amount = Math.floor(100 * account.interestRate * account.balance) / 100
        transaction(user.accounts[0], amount, 'Interest')
        dirty.push('accountBalances')
      }
    }

    if (dirty.length > 0) {
      client.refresh(dirty)
    }
    delete user.events[state.frame]
  }

  server.start = function (newClient) {
    if (client != null) error("attempt to start server more than once")
    client = newClient
    setupNewUser();
    setInterval(tick, 1000)
  }

  server.createAccount = function (accountType, accountName, startBalance, oldAccountIndex) {
    const oldAccount = user.accounts[oldAccountIndex]
    if (!oldAccount) {
      client.toast(`Please select an account to transfer the starting balance from.`)
      return
    }
    if (startBalance < server.MINIMUM_NEW_ACCOUNT_BALANCE) {
      client.toast(`You must transfer at least ${cash(server.MINIMUM_NEW_ACCOUNT_BALANCE)} to open a new account.`)
      return
    }
    if (oldAccount.balance < startBalance) {
      client.toast(`The existing account ${oldAccount.name} does not have ${cash(startBalance)} available.`)
      return
    }
    const newAccount = {
      name: accountName,
      type: accountType,
      balance: 0,
      txns: []
    }
    if (newAccount.type === 'term investment') {
      newAccount.endDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      newAccount.interestRate = 0.01
    }
    user.accounts.push(newAccount)
    transaction(oldAccount, -startBalance, 'Transfer to ' + accountName)
    transaction(newAccount, startBalance, 'Opening balance')
    client.toast("New account created!")
    client.showAccounts()
  }
}