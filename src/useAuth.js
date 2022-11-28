import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core"
import { NoEthereumProviderError, UserRejectedRequestError as UserRejectedRequestErrorInjected } from "@web3-react/injected-connector"
import {
    UserRejectedRequestError as UserRejectedRequestErrorWalletConnect,
    WalletConnectConnector,
} from '@web3-react/walletconnect-connector'
import { setupNetwork } from './setupNetwork'



const useAuth = () => {
    const { activate, deactivate, setError } = useWeb3React()

    const login = async(connector) => {
        if (typeof connector !== 'function' && connector) {
            activate(connector, async(error) => {

                if (error instanceof UnsupportedChainIdError) {
                    setError(error)
                    const provider = await connector.getProvider()
                    const hasSetup = await setupNetwork(provider)
                    if (hasSetup) {
                        activate(connector)
                    }
                } else {
                    if (error instanceof NoEthereumProviderError) {
                        alert('Metamask wallet not found')
                    } else if (error instanceof UserRejectedRequestErrorInjected || error instanceof UserRejectedRequestErrorWalletConnect) {
                        if (connector instanceof WalletConnectConnector) {
                            const walletConnector = connector
                            walletConnector.walletConnectProvider = null
                        }
                        alert('Please authorize to access your account')
                    } else {
                        alert(error.message)
                    }
                }

            })

        } else {
            toastError('Unable to find connector')
        }
    }

    // logout
    const logout = async(connector) => {
        if (connector instanceof WalletConnectConnector) {
            await connector.close()
            window.location.reload()
        } else {
            deactivate()
            window.location.reload()
        }
    }
    return { login, logout }
}

export default useAuth