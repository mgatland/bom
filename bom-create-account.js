const mCreateAccountPage = {}

function cash(num) {
  return Number(num).toFixed(2)
}

const everyAccountDesc = `It's free to deposit and withdraw money from an Everyday account.`
const termInvestmentAccountDesc = `
<div class="mb-3">Money placed into a Term Investment is locked and cannot be removed until the end of the term. However, the account earns interest which is paid into your primary account.
</div>
<div class="mb-3">Term: 1 Year
</div>
<div class="">Interest: 1% per second
</div>
`

mCreateAccountPage.setup = function (basePage, server) { 
  basePage.innerHTML = `
  <h1 class="text-xl font-semibold py-8 px-4 border-b-2">
  <i class="fa-solid fa-chevron-left -m-4 mr-0 p-4 bom-show-accounts cursor-pointer"></i>
  Create new Account</h1>
  <div class="mx-4 mb-3 mt-3">Account type:</div>
  <div class="mx-4 mb-3 menu p-0">
    <input class="btn bom-create-account-0" type="radio" name="options" aria-label="Everyday account" value="everyday" checked>
    <input class="btn bom-create-account-1" type="radio" name="options" aria-label="Term Investment account" value="term investment" >
  </div>
  <div class="mx-4 mb-3 bom-account-type-description">${everyAccountDesc}</div>
  <div class="mx-4 mb-3">You must transfer at least 150 Coins of Matthew into the new account as the opening balance.</div>
  <label class="input input-bordered flex items-center gap-2 mx-4 mb-3">
  Account Name:
  <input type="text" class="grow bom-new-account-name" value="Everyday 2">
  </label>
  <label class="input input-bordered flex items-center gap-2 mx-4 mb-3">
  Starting balance:
  <input type="number" class="grow bom-new-account-balance" value="150">
  </label>
  <div class="mx-4 mb-3 mt-3">Transfer starting balance from:</div>
  <div class="mx-4 mb-3">
    <select class="select select-bordered w-full max-w-xs bom-new-account-transfer-list">
    </select>
  </div>
  <div class="btn mx-4 mb-3 bom-create-account-button">Create Account</div>
  `
  const accountDescriptionEl = basePage.querySelector('.bom-account-type-description')
  const newAccountNameEl = basePage.querySelector('.bom-new-account-name')
  const accountsListEl = basePage.querySelector('.bom-new-account-transfer-list')
  const createButton = basePage.querySelector('.bom-create-account-button')
  const startBalanceEl = basePage.querySelector('.bom-new-account-balance')

  function selectEveryday (e) {
    accountDescriptionEl.innerHTML = everyAccountDesc
    newAccountNameEl.value = getAccountName('Everyday')
  }
  
  basePage.querySelector('.bom-create-account-0').addEventListener('click', selectEveryday)
  basePage.querySelector('.bom-create-account-1').addEventListener('click', function (e) {
    accountDescriptionEl.innerHTML = termInvestmentAccountDesc
    newAccountNameEl.value = getAccountName('Term Investment')
  })
  
  function getAccountName(baseName) {
    const accounts = server.getAccounts()
    const isNameTaken = (name) => accounts.find(x => x.name === name)
    if (isNameTaken(baseName)) {
      let counter = 2
      while (isNameTaken(baseName + ' ' + counter)) {
        counter++
      }
      return baseName + ' ' + counter
    }
    return baseName
  }

  function updateAccountsList() {
    accountsListEl.innerHTML = `<option disabled selected>Select account</option>`
    let index = 0
    for (const account of server.getAccounts()) {
      if (account.type != 'term investment') { //needs server-side valdiation
        accountsListEl.innerHTML += `<option value="${index}">${account.name} – $${cash(account.balance)}</option>`
      }
      index++
    }
  }

  mCreateAccountPage.refresh = function () {
    basePage.querySelector('.bom-create-account-0').checked = true
    startBalanceEl.value = 150
    selectEveryday()
    updateAccountsList()
  }

  createButton.addEventListener('click', function(e) {
    const accountType = basePage.querySelector('input:checked').value
    const accountName = newAccountNameEl.value
    const startBalance = startBalanceEl.value
    const transferFrom = accountsListEl.value

    server.createAccount(accountType, accountName, startBalance, transferFrom)
  })

  mCreateAccountPage.refresh()
}



export default mCreateAccountPage