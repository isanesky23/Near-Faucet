import 'regenerator-runtime/runtime'
import { utils } from 'near-api-js';
import { initContract, login, logout, sendToken, getAccountBalance } from './utils'
import getConfig from './config'
const { networkId } = getConfig(process.env.NODE_ENV || 'development')

async function fetchAccountBalance() {
    let myAccount = window.accountId;
    let balance = await getAccountBalance(myAccount);
    let available = balance.available;
    let balanceInNear = utils.format.formatNearAmount(available);
    balanceInNear = parseFloat(balanceInNear).toFixed(4);
    console.log(balance);
    $('span#account_balance').text(balanceInNear);
}

async function claim(claim_account, login_account, amount) {

    const amount_to_claim = utils.format.parseNearAmount(amount);
    let ip = await getIpAddress();
        ip = ip.ipAddress.toString();
    //console.log(ip.ipAddress);

    let isClaimable = await window.contract.isClaimable({ipAddress: ip});
    let claimers = await window.contract.getClaimers();
    let blockTime = await window.contract.getBlockDateTime();
    console.log(claimers);
    console.log(blockTime);
    if(isClaimable) {
        try {
            //await window.contract.claimToken({_ip: ip,_account: claim_account, _amount: amount_to_claim});
            await window.contract.claimToken({_ip: ip, _account: claim_account, _amount: amount_to_claim});
            Swal.fire({
                title: 'DONE!',
                text: 'Claim successful!',
                icon: 'success',
                confirmButtonText: 'Cool'
            });
        }
        catch(error) {
            console.log(error);
            Swal.fire({
                title: 'ERROR!',
                text: 'ERROR! - ' + error,
                icon: 'error',
                confirmButtonText: 'Cool'
            });
        }
    }
    else {
        Swal.fire({
            title: 'ERROR!',
            text: 'You only can claim once per day!',
            icon: 'error',
            confirmButtonText: 'Cool'
        });
    }
}

async function getIpAddress() {
    let data = await $.getJSON('https://api.db-ip.com/v2/free/self', function(data) {
    return JSON.stringify(data, null, 2);
    });

    return data;
}
        
$(document).ready(async function() {
    //fetch all products
    await fetchAccountBalance();

    $('button#btn_claim').click(async function(e) {
        e.preventDefault();
        let accountId = window.accountId;
        let account = $('input#account').val();
        let amount = $('#selectamount').val();
        //let amount = "1";   
        claim(account, accountId, amount);
    });

});

document.querySelector('#sign-in-button').onclick = login
document.querySelector('#sign-out-button').onclick = logout

// Display the signed-out-flow container
function signedOutFlow() {
    document.querySelector('#signed-out-flow').style.display = 'block'
}

// Displaying the signed in flow container and fill in account-specific data
function signedInFlow() {
    document.querySelector('#signed-in-flow').style.display = 'block'

    document.querySelectorAll('[data-behavior=account-id]').forEach(el => {
        el.innerText = window.accountId
    })

    // populate links in the notification box
    const accountLink = document.querySelector('[data-behavior=notification] a:nth-of-type(1)')
    accountLink.href = accountLink.href + window.accountId
    accountLink.innerText = '@' + window.accountId
    const contractLink = document.querySelector('[data-behavior=notification] a:nth-of-type(2)')
    contractLink.href = contractLink.href + window.contract.contractId
    contractLink.innerText = '@' + window.contract.contractId

    // update with selected networkId
    accountLink.href = accountLink.href.replace('testnet', networkId)
    contractLink.href = contractLink.href.replace('testnet', networkId)
        //fetch greeting

}

// `nearInitPromise` gets called on page load
window.nearInitPromise = initContract()
    .then(() => {
        if (window.walletConnection.isSignedIn()) signedInFlow()
        else signedOutFlow()
    })
    .catch(console.error)