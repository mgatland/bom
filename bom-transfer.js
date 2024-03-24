import { cash } from './util.js'

const mTransferPage = {}

mTransferPage.setup = function (basePage, server) { 

  let html = `
    <div class="py-8 px-4 border-b-2"> 
      <div class="text-xl font-semibold flex flex-row items-center">
        <i class="fa-solid fa-chevron-left -m-4 mr-0 p-4 bom-show-accounts cursor-pointer"></i>
        <span> Transfer money</span>
      </div>
    </div>
    <div class="m-4">Enter the amount to transfer</div>
   <label class="input input-bordered flex items-center gap-2 mx-4 mb-3">
   <div class="m-4">Amount:</div>
     <input type="number" class="grow bom-amount" value="150">
   </label>
   <div class="m-4">Transfer from:</div>
   <div class="mx-4 mb-3">
     <select class="select select-bordered w-full max-w-xs bom-transfer-from">
     </select>
   </div>
   <div class="m-4">Transfer to:</div>
   <div class="mx-4 mb-3">
    <select class="select select-bordered w-full max-w-xs bom-transfer-to">
    </select>
    </div>
   <div class="btn mx-4 mb-3 bom-confirm">Confirm Transfer</div>
    ` 
  basePage.innerHTML = html

  const fromAccountEl = basePage.querySelector('.bom-transfer-from')
  const toAccountEl = basePage.querySelector('.bom-transfer-to')
  const confirmEl = basePage.querySelector('.bom-confirm')
  const amountEl = basePage.querySelector('.bom-amount')

  confirmEl.addEventListener('click', function (e) {
    const amount = parseFloat(amountEl.value)
    const transferFrom = fromAccountEl.value
    const transferTo = toAccountEl.value
    server.createTransfer(amount, transferFrom, transferTo)
  })

  mTransferPage.show = function() {
    const accounts = server.getAccounts()
    const fromAccounts = accounts.filter(x => x.type != 'term investment')
    const toAccounts = accounts

    fromAccountEl.innerHTML = `<option disabled selected>Select account</option>`
    let index = 0
    for (const account of server.getAccounts()) {
      if (account.type != 'term investment') { //needs server-side valdiation
        fromAccountEl.innerHTML += `<option value="${index}">${account.name} – $${cash(account.balance)}</option>`
      }
      index++
    }  
    
    toAccountEl.innerHTML = `<option disabled selected>Select account</option>`
    index = 0
    for (const account of server.getAccounts()) {
      toAccountEl.innerHTML += `<option value="${index}">${account.name} – $${cash(account.balance)}</option>`
      index++
    }  
  }
}

export default mTransferPage