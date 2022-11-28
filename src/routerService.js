import { ChainId, Fetcher, Route, Trade, TokenAmount, TradeType, Percent } from "@pancakeswap-libs/sdk-v2"
import { ethers } from "ethers"
import Web3 from "web3"
import { abis } from "./abis"
import { addresses } from "./contracts"


const ethersProvider = new ethers.providers.JsonRpcProvider(
  "https://bsc-dataseed.binance.org/",
  { name: "binance", chainId: 56 }
)

const web3Provider = new Web3(new Web3.providers.HttpProvider("https://bsc-dataseed.binance.org/"))


export const getSwapPrice = async (direction, value, slippage) => {
  const laykaToken = await Fetcher.fetchTokenData(ChainId.MAINNET, ethers.utils.getAddress(addresses.LAYKA), ethersProvider)
  const wbnbToken = await Fetcher.fetchTokenData(ChainId.MAINNET, ethers.utils.getAddress(addresses.WBNB), ethersProvider)
  const busdToken = await Fetcher.fetchTokenData(ChainId.MAINNET, ethers.utils.getAddress(addresses.BUSD), ethersProvider)

  const pairA = !direction ? await Fetcher.fetchPairData(laykaToken, wbnbToken, ethersProvider) : await Fetcher.fetchPairData(busdToken, wbnbToken, ethersProvider)
  const pairB = !direction ? await Fetcher.fetchPairData(wbnbToken, busdToken, ethersProvider) : await Fetcher.fetchPairData(wbnbToken, laykaToken, ethersProvider)

  const route = new Route([pairA, pairB], !direction ? laykaToken : busdToken)
  let amountIn = ethers.utils.parseEther(value.toString());
  amountIn = amountIn.toString()
  const slippageTolerance = new Percent(slippage, '100')
  const trade = new Trade(
    route,
    new TokenAmount(!direction ? laykaToken : busdToken, amountIn),
    TradeType.EXACT_INPUT
  )

  const amountOutMin = trade.minimumAmountOut(slippageTolerance).toSignificant(6)
  return amountOutMin
}

const loadContract = (provider, abi, address) => {
  const web3 = new Web3(provider)
  return new web3.eth.Contract(abi, address)
}

export const swap = async (direction, amount, provider, account, slippage, te, ts) => {
  try {
    const laykaToken = await Fetcher.fetchTokenData(ChainId.MAINNET, ethers.utils.getAddress(addresses.LAYKA), ethersProvider)
    const wbnbToken = await Fetcher.fetchTokenData(ChainId.MAINNET, ethers.utils.getAddress(addresses.WBNB), ethersProvider)
    const busdToken = await Fetcher.fetchTokenData(ChainId.MAINNET, ethers.utils.getAddress(addresses.BUSD), ethersProvider)

    const pairA = !direction ? await Fetcher.fetchPairData(laykaToken, wbnbToken, ethersProvider) : await Fetcher.fetchPairData(busdToken, wbnbToken, ethersProvider)
    const pairB = !direction ? await Fetcher.fetchPairData(wbnbToken, busdToken, ethersProvider) : await Fetcher.fetchPairData(wbnbToken, laykaToken, ethersProvider)

    const route = new Route([pairA, pairB], !direction ? laykaToken : busdToken)
    let amountIn = ethers.utils.parseEther(amount.toString());
    amountIn = amountIn.toString()
    const slippageTolerance = new Percent(slippage, '100')
    const trade = new Trade(
      route,
      new TokenAmount(!direction ? laykaToken : busdToken, amountIn),
      TradeType.EXACT_INPUT
    )
    const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw
    const amountOutMinHex = ethers.BigNumber.from(amountOutMin.toString()).toHexString()
    const path = !direction ? [addresses.LAYKA, addresses.WBNB, addresses.BUSD] : [addresses.BUSD, addresses.WBNB, addresses.LAYKA]
    const to = account
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20
    const value = trade.inputAmount.raw
    const valueHex = await ethers.BigNumber.from(value.toString()).toHexString()
    
    const tokenContract = loadContract(provider, !direction ? abis.LAYKA : abis.BUSD, !direction ? addresses.LAYKA : addresses.BUSD)
    const contract = loadContract(provider, abis.ROUTER, addresses.PANCAKESWAPROUTER)

    const approve = await tokenContract.methods.approve(addresses.PANCAKESWAPROUTER, amountIn).send({ from: account })

    const tx = await contract.methods.swapExactTokensForTokens(
      valueHex,
      amountOutMinHex,
      path,
      to,
      deadline
    ).send({ from: account })
      ts(`Your transaction is completed with transaction hash ${tx.transactionHash}`)
    return tx

  } catch (e) {
    console.log(e)
    te(e.message)
  }
}

export const getLyakaPrice = async () => {
  try {
    const laykaToken = await Fetcher.fetchTokenData(ChainId.MAINNET, ethers.utils.getAddress(addresses.LAYKA), ethersProvider)
    const wbnbToken = await Fetcher.fetchTokenData(ChainId.MAINNET, ethers.utils.getAddress(addresses.WBNB), ethersProvider)
    const busdToken = await Fetcher.fetchTokenData(ChainId.MAINNET, ethers.utils.getAddress(addresses.BUSD), ethersProvider)

    const pairA =  await Fetcher.fetchPairData(laykaToken, wbnbToken, ethersProvider) 
    const pairB =   await Fetcher.fetchPairData(wbnbToken, busdToken, ethersProvider) 

    const route = new Route([pairA, pairB],  laykaToken )
    const price  = route.midPrice.toSignificant(6)
    return price
  } catch (e) {
    console.log(e);
  }
}

export const getGasPrice = async () => {
  const web3 = new Web3(web3Provider)
  const valueHex = '0x06aaf7c8516d0c0000'
  const amountOutMinHex = '0x023cdf0026a3583bd3'
  const path = ['0x26844Ffd91648e8274598e6e18921a3E5Dc14ADe', '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56']
  const to = '0x8471e5c5A33b2b30Ed0Fd06C2BE55c00059Ab05b'
  const deadline = 1666707564
  const erc20 = new ethers.Contract(addresses.PANCAKESWAPROUTER, abis.ROUTER, ethersProvider)
  const estimation = await erc20.estimateGas.swapExactTokensForTokens( valueHex,
    amountOutMinHex,
    path,
    to,
    deadline)
    return estimation
}