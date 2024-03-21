const user = {}
const state = {user, frame:0}

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
      balance: 0,
      txns: []
    }
    user.emptyInboxTime = 4 // hack to more quickly trigger the welcome email
    user.events = {}
  }

  function createWelcomeMessage() {
    user.freeGiftNumber++
    user.unclaimedGifts.push(user.freeGiftNumber)
    return {
      read: false,
      date: new Date(),
      title: `A welcome gift for you!`,
      text: `Dear &lt;USERS WHERE MESSAGES.COUNT = 0&gt;,<br><br>Welcome to Bank of Matthew, the new financial system that's Better than Bitcoin. As a thank you for joining us on this journey, we'd like to send you 100 Coins of Matthew as a welcome gift.`,
      action: {type:'freeGift', 
        id:user.freeGiftNumber,
        text:freeGiftText},
      id: `free-gift-${user.freeGiftNumber}`
    }
  }

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

  function giveMoney(amount) {
    const account = user.accounts[0]
    account.balance += amount
    toast(`Your ${account.name} account balance is now $${cash(account.balance)}`)
  }

  function toast(message) {
    //toasts are transient and not persisted
    client.toast(message)
  }

  function tick() {
    state.frame = (state.frame + 1 % (60 * 60))
    if (user.messages.length == 0) {
      user.emptyInboxTime++
      if (user.emptyInboxTime >= 5) {
        user.messages.push(createWelcomeMessage())
        user.emptyInboxTime = 0
        client.refresh()
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
        client.refresh()
      }
    }
    delete user.events[state.frame]
  }

  server.start = function (newClient) {
    if (client != null) error("attempt to start server more than once")
    client = newClient
    setupNewUser();
    setInterval(tick, 1000)
  }
}