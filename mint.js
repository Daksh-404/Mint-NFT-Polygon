const { ethers } = require("ethers")
const fs = require('fs')

const privateKey = fs.readFileSync(".secret").toString().trim()

const QUICKNODE_HTTP_ENDPOINT = "https://attentive-thrilling-replica.matic-testnet.discover.quiknode.pro/44e62a91602f5065cb7f8e41f8cd0142568bf039/"
const provider = new ethers.providers.JsonRpcProvider(QUICKNODE_HTTP_ENDPOINT)

const contractAddress = "0x66e47a27241f38b8482c0ae95e55a535324f9f54"
const contractAbi = fs.readFileSync("abi.json").toString()
const contractInstance = new ethers.Contract(contractAddress, contractAbi, provider)

const wallet = new ethers.Wallet(privateKey, provider)

async function getGasPrice() {
    let feeData = (await provider.getGasPrice()).toNumber()
    return feeData
}

async function getNonce(signer) {
    let nonce = await provider.getTransactionCount(wallet.address)
    return nonce
}

export default async function mintNFT(address, URI) {
    try {
        const nonce = await getNonce(wallet)
        const gasFee = await getGasPrice()
        let rawTxn = await contractInstance.populateTransaction.safeMint(address, URI, {
            gasPrice: gasFee, 
            nonce: nonce
        })
        console.log("...Submitting transaction with gas price of:", ethers.utils.formatUnits(gasFee, "gwei"), " - & nonce:", nonce)
        let signedTxn = (await wallet).sendTransaction(rawTxn)
        let reciept = (await signedTxn).wait()
        if (reciept) {
            let transactionHash = (await signedTxn).hash
            let blockNum = (await reciept).blockNumber
            let polygonScanLink = "https://polygonscan.com/tx/" + transactionHash
            let openSeasLink = "https://testnets/openseas.io/assets/mumbai/" + transactionHash
            console.log("Transaction is successful!!!")
            return transactionHash, blockNum, polygonScanLink, openSeasLink
        } else {
            console.log("Error submitting transaction")
            return null
        }
    } catch (e) {
        console.log("Error Caught in Catch Statement: ", e)
        return null
    }
}

