const mAccountPage = {}

function cash(num) {
  return Number(num).toFixed(2)
}

function formatDateTime(d) {
  return ("0" + d.getDate()).slice(-2) + "-" + ("0"+(d.getMonth()+1)).slice(-2) 
  //+ "-" + d.getFullYear() 
  + " " + ("0" + d.getHours()).slice(-2) + ":" 
  + ("0" + d.getMinutes()).slice(-2) 
  //+ ":" + ("0" + d.getSeconds()).slice(-2)
  
}

function mp(txn) {
  //display the multiplier
  if (!txn.multiplier) return ''
  return ' × ' + txn.multiplier 
}

mAccountPage.setup = function (basePage, server) { 
  
  mAccountPage.show = function(accountNum) {
    const account = server.getAccounts()[accountNum]
    const isTermInvestment = account.type === 'term investment'
    const n = accountNum
    let html = `
    <div class="py-8 px-4 border-b-2"> 
      <div class="text-xl font-semibold flex flex-row items-center">
        <i class="fa-solid fa-chevron-left -m-4 mr-0 p-4 bom-show-accounts cursor-pointer"></i>
        <span> ${account.name}</span>
        <div class="flex-1"></div>
        <div class="px-4 bom-acc-bal-${n} ${isTermInvestment ? ' text-slate-400' : ''}">$${cash(account.balance)}</div>
      </div>
    `
    if (account.type === 'term investment') {
    html += `   <div class="flex flex-row ml-8">
        <div class="text-slate-400">Locked until ${account.endDate.toLocaleDateString("en-NZ")}</div>
        <div class="flex-1"></div>
        <div class="pl-4 pr-4 bom-acc-int-${n}">Interest: $${cash(account.balance * account.interestRate)}</div>
        <!--<div class="pr-4 mr-4 loading loading-ring loading-md"></div>-->
      </div>`
    }
    html += `  
    </div>
    <div class="text-lg font-bold py-8 px-4">Transactions</div>
    <div class="grid px-4 grid-cols-[minmax(0,_1fr)_auto_minmax(0,_1fr)_minmax(0,_1fr)_minmax(0,_1fr)]">
    <div class="font-semibold border-b-2 pl-2 border-slate-400">Date</div>
    <div class="font-semibold border-b-2 border-slate-400">Description</div>
    <div class="font-semibold border-b-2 border-slate-400">Money out</div>
    <div class="font-semibold border-b-2 border-slate-400">Money in</div>
    <div class="font-semibold border-b-2 border-slate-400">Balance</div>
    `
    const txns = account.txns.slice().reverse()
    let toggle = false
    for (const txn of txns) {
      toggle = !toggle
      const style = toggle ? '' : 'bg-slate-100'
      html += `
      <div class="pl-2 pr-2 py-4 ${style}">${formatDateTime(txn.date)}</div>
      <div class="pr-2 py-4 ${style}">${txn.message}</div>
      <div class="pr-2 py-4 ${style}">${txn.amount < 0 ? '$' + cash(-txn.amount) + mp(txn) : ''}</div>
      <div class="pr-2 py-4 ${style}">${txn.amount >= 0 ? '$' + cash(txn.amount) + mp(txn) : ''}</div>
      <div class="pr-2 py-4 ${style}">$${cash(txn.balance)}</div>
      `
    }
    html += `</div>`
    basePage.innerHTML = html
    let a = `
    
    <div class="mx-4 mb-3 mt-3">Account type:</div>
    <div class="mx-4 mb-3 menu p-0">
    <input class="btn bom-create-account-0" type="radio" name="options" aria-label="Everyday account" value="everyday" checked>
    <input class="btn bom-create-account-1" type="radio" name="options" aria-label="Term Investment account" value="term investment" >
    </div>
    <div class="mx-4 mb-3 bom-account-type-description"></div>
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
  }
}

export default mAccountPage