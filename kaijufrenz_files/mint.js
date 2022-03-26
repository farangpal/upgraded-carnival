var preSaleAddresses = preSaleAddresses;
var freeSaleAddresses = freeSaleAddresses;
var ABI = ABI;
window.onload = function () {
  var proofPreSaleAddresses = preSaleAddresses;
  var proofFreeSaleAddresses = freeSaleAddresses;
  const vue = new Vue({
    el: '#vue-app',
    data() {
      return {
        //Constants
        connected: false,
        account: null,
        contractAddress: "0xc92090f070bf50eec26d849c88a68112f4f3d98e",
        nftContract: null,
        isLoading: true,
        isPublicSale: false,
        isPreSale: false,
        isFreeSale:false,
        isFreesaleListed:false,
        isPresaleListed:false,
        supplyCounter: 0,
        MAX_SUPPLY: 6666,
        numberOfTokens: 1,
        proofPreSaleAddresses: proofPreSaleAddresses,
        proofFreeSaleAddresses: proofFreeSaleAddresses,
        network: '1', //mainnet-1 testnet-4
        currentNetwork: '',
        WALLET_LIMIT:2,
        maxMint: 0,
        PUBLIC_PRICE: 0.12,
        WL_PRICE:0.088,
        balance:0,
        step:1,
        url:"https://1-0-1--signer.bonkcrypto.autocode.gg/",
        ABI: ABI,
        errorMessage:"",
        errorLists:{"execution reverted: EXCEED_MINT_LIMIT":"You cannot mint more than 2 NFTs",
        "execution reverted: CANNOT_MINT_ON_THE_SAME_BLOCK":"You cannot mint on the same block",
        "execution reverted: CONTRACTS_NOT_ALLOWED_TO_MINT":"Contract minting is not allowed",
        "execution reverted: FREE_MINT_IS_NOT_YET_ACTIVE":"Free mint is not yet active",
        "execution reverted: PRESALE_MINT_IS_NOT_YET_ACTIVE":"Presale mint is not yet active",
        "execution reverted: PUBLIC_MINT_IS_NOT_YET_ACTIVE":"Public mint is not yet active",
        "execution reverted: EXPIRED_SIGNATURE":"Cannot use expired signature",
        "execution reverted: SIGNATURE_LOOPING_NOT_ALLOWED":"Signature looping is not allowed",
        "execution reverted: NOT_ENOUGH_SUPPLY":"Can't exceed max supply limit",
        "execution reverted: NOT_ENOUGH_ETH":"Not enough ETH to complete the transaction",
        "execution reverted: PROOF_INVALID":"Proof is invalid",
        "execution reverted: NOT_ENOUGH_PRESALE_SUPPLY":"Can't exceed max supply limit on presale",
        "execution reverted: EXCEED_PRESALE_MINT_LIMIT":"Can't mint more than 1 NFT on presale",
        "execution reverted: ALREADY_FREE_MINTED":"You have already free minted",
        "execution reverted: NOT_ENOUGH_FREE_SUPPLY":"Can't exceed max supply limit on free",
        "execution reverted: NOT_ENOUGH_TEAM_ALLOCATION":"Not enough team allocation"
        }        
      };
    },
    methods: {
      async appInit() {
        if (window.ethereum) {
          window.web3 = new Web3(window.ethereum);
          window.web3.eth.handleRevert = true;
          this.currentNetwork = window.ethereum.networkVersion;
          if (this.currentNetwork == null) {
            this.currentNetwork = await window.ethereum.request({
              method: 'net_version',
            });
          }
          if (this.currentNetwork != this.network) {
            // this.connect();
          }
          this.nftContract = new window.web3.eth.Contract(
            this.ABI,
            this.contractAddress
          );
          web3.eth.getAccounts().then(async (address) => {
            if (address.length !== 0) {
              this.account = await window.ethereum.request({method:"eth_requestAccounts"});
              this.account = this.account[0]
              await this.initData();
            }

            

            if (this.isLoading == true) {
              this.isLoading = false;
            }
          });
        } else {
          this.account = null;
        }
      },
      async initData(){
        this.isPreSale = await this.nftContract.methods
        .isPresaleActive()
        .call();
      this.isPublicSale = await this.nftContract.methods
        .isPublicSaleActive()
        .call();
    
      this.isFreeSale = await this.nftContract.methods
        .isFreeActive()
        .call();
      this.supplyCounter = parseInt(
        await this.nftContract.methods.totalSupply().call()
      );
      this.MAX_SUPPLY = parseInt(
        await this.nftContract.methods.MAX_SUPPLY().call()
      );
      this.balance = parseInt(
        await this.nftContract.methods.balanceOf(this.account).call()
      );
    
      if(this.isPublicSale){
        this.maxMint = this.WALLET_LIMIT - this.balance;
      }else{
        this.maxMint = 1;
      }

    
    
      this.PUBLIC_PRICE = parseFloat(
        web3.utils.fromWei(
          await this.nftContract.methods.PUBLIC_PRICE().call(),
          'ether'
        )
      );
      this.WL_PRICE = parseFloat(
        web3.utils.fromWei(
          await this.nftContract.methods.WL_PRICE().call(),
          'ether'
        )
      );
    
      this.isFreesaleListed = this.proofFreeSaleAddresses.filter(x => x.toLowerCase() == this.account.toLowerCase()).length > 0;
      this.isPresaleListed = this.proofPreSaleAddresses.filter(x => x.toLowerCase() == this.account.toLowerCase()).length > 0;
      },
      async connect() {
        this.currentNetwork = window.ethereum.networkVersion;
        if (this.currentNetwork == null) {
          this.currentNetwork = await window.ethereum.request({
            method: 'net_version',
          });
        }
        if (this.currentNetwork != this.network) {
          await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${this.network}` }],
          });
        }
        this.account = await window.ethereum.request({method:"eth_requestAccounts"});
        this.account = this.account[0]
        await this.initData();
      },
      async purchasePublic() {
        try {
          let amount;
          amount = window.web3.utils.toWei(
            (this.numberOfTokens * this.PUBLIC_PRICE).toString(),
            'ether'
          );
          let walletBalance = await window.web3.eth.getBalance(this.account);
          if(parseInt(walletBalance) <= parseInt(amount)){
            this.processErrorMessage({message:"You do not have enough balance to mint."})
          }
          this.step = 2;
          var data = await this.requestSignature();
          try {
            await this.nftContract.methods
              .mint(this.numberOfTokens,data.expireTime,data.signature)
              .estimateGas({
                from: this.account,
                value: amount,
              });
          } catch (e) {
            this.processErrorMessage(e);
            this.step = 1;
            return;
          }
          let tx = await this.nftContract.methods
          .mint(this.numberOfTokens,data.expireTime,data.signature)
            .send({
              from: this.account,
              value: amount,
            });
            this.step = 3;
          console.log(tx);
        } catch (e) {
          this.step = 1;
          console.log(e);
        }
      },
      async purchasePreSale() {
        try {
          let amount = window.web3.utils.toWei(
            (this.WL_PRICE).toString(),
            'ether'
          );
          let walletBalance = await window.web3.eth.getBalance(this.account);
          if(parseInt(walletBalance) <= parseInt(amount)){
            this.processErrorMessage({message:"You do not have enough balance to mint."})
          }
          var merkle = this.generateProof(
            this.account,
            this.proofPreSaleAddresses
          );
          this.step = 2;
          try {
            await this.nftContract.methods
              .presaleMint(merkle.proof)
              .estimateGas({
                from: this.account,
                value: amount,
              });
          } catch (e) {
            this.processErrorMessage(e)
            this.step = 1;
            return;
          }
          let tx = await this.nftContract.methods
            .presaleMint(merkle.proof)
            .send({
              from: this.account,
              value: amount,
            });
            this.step = 3;
          console.log(tx);
        } catch (e) {
          this.step = 1;
          console.log(e);
        }
      },
      async purchaseFreeSale() {
        try {
          var merkle = this.generateProof(
            this.account,
            this.proofFreeSaleAddresses
          );
          this.step = 2;
          try {
            await this.nftContract.methods.freeMint(merkle.proof).estimateGas({
              from: this.account,
            });
          } catch (e) {
            this.processErrorMessage(e)
            this.step = 1;
            return;
          }
          let tx = await this.nftContract.methods.freeMint(merkle.proof).send({
            from: this.account,
          });
          this.step = 3;
          console.log(tx);
        } catch (e) {
          this.step = 1;
          console.log(e);
        }
      },
      generateProof(address, proofAddresses) {
        const leaves = proofAddresses.map((v) => keccak256(v));
        const tree = new MerkleTree(leaves, keccak256, { sort: true });
        const leaf = keccak256(address);
        const proof = tree.getHexProof(leaf);
        return { leaf: '0x' + leaf.toString('hex'), proof };
      },
      
      splitAddress(){
        if(this.account){
          return this.account.slice(0,6) +"..." + this.account.slice(-4);
        }

      },
      increment() {
        if(this.numberOfTokens < (this.maxMint)) this.numberOfTokens++;
      },
      decrement(){
        if(this.numberOfTokens > 1) this.numberOfTokens--;
      },
      mintAgain(){
        this.step = 1;
      },
      processErrorMessage(error){
        $('#mint-modal-error').show('fast');
        const middle = error.message.slice(
          error.message.indexOf('{'),
          error.message.lastIndexOf('}')+1,
        );
        if(middle == "") this.errorMessage =  error.message;
        var parsed = JSON.parse(middle);
        var translated = this.errorLists[parsed.originalError.message]
        if(translated == undefined){
          this.errorMessage = parsed.originalError.message;
        }else{
          this.errorMessage = translated;
        }

      },
      //Http post request
      async requestSignature() {
        var data = {
          "sender": this.account,
          "numberOfTokens": this.numberOfTokens
        }
        const response = await fetch(this.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        return await response.json();
      }
    },
    mounted() {
      this.appInit();
      // this.connect();
    },
  });

  if (window.ethereum) {
    window.ethereum.on('accountsChanged', function (accounts) {
      if (accounts.length !== 0) {
        vue.account = accounts[0];
        vue.initData();
      } else {
        vue.account = null;
        this.appInit();
      }
    });
    window.ethereum.on('chainChanged', (_chainId) => vue.appInit());
  } else {
    console.log('Please install metamask');
  }

  setInterval(() => {
    vue.appInit();
  }, 3000);
};
