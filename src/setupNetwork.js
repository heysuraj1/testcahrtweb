export const setupNetwork = async(externalProvider) => {
    const provider = externalProvider || window.ethereum
    const chainId = 56
    const chainName = "Binance Smart Chain"
    const symbol = 'BNB'
    const decimals = 18
    const nativeCurrencyName = "bnb"
    const rpc = "https://bsc-dataseed1.binance.org/"
    const blockExplorerUrl = "https://bscscan.com/"

    if (provider) {
        try {
            await provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${chainId.toString(16)}` }],
            })
            return true
        } catch (switchError) {
            if (switchError.code === 4001) {
                alert('You have to switch network')
            }
            if (switchError.code === 4902) {
                try {
                    await provider.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: `0x${chainId.toString(16)}`,
                            chainName: chainName,
                            nativeCurrency: {
                                name: nativeCurrencyName,
                                symbol: symbol,
                                decimals: decimals,
                            },
                            rpcUrls: rpc,
                            blockExplorerUrls: [blockExplorerUrl],
                        }, ],
                    })
                    return true
                } catch (error) {
                    console.error('Failed to setup the network in Metamask:', error)
                    return false
                }
            }
            return false
        }
    } else {
        console.error("Can't setup the BSC network on metamask because window.ethereum is undefined")
        return false
    }
}