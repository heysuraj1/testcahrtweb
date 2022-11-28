import { useWeb3React } from "@web3-react/core";
import React, { useEffect, useMemo, useState } from "react";
import { Chart } from "react-charts";
import Web3 from "web3";
import { ethers } from 'ethers'
import { injected } from "./connector";
import { addresses } from './contracts'
import { abis } from './abis'
import { getGasPrice, getLyakaPrice, getSwapPrice, swap } from "./routerService";
import ConfirmTransactionModal from "./Components/ConfirmTransactionModal";
import Settings from "./Components/Settings";
import axios from "axios";
import { Toaster } from 'react-hot-toast'
import useToast from "./useToast";
import PulseLoader from "react-spinners/PulseLoader"
import LineChart from "./Components/LineChart";



const App = () => {

  const { activate, active, account, library, deactivate } = useWeb3React()
  const [laykaAmount, setLaykaAmount] = useState('')
  const [busdAmount, setBusdAmount] = useState('')
  const [laykaBalance, setLaykaBalance] = useState(0)
  const [busdBalance, setBusdBalance] = useState(0)
  const [showGasPopup, setShowGasPopup] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [direction, setDirection] = useState(false)
  const [slippage, setSlippage] = useState('1')
  const [gasPrice, setGasPrice] = useState(undefined)
  const [loadingTx, setLoadingTx] = useState(false)
  const [timeFrame, setTimeFrame] = useState(24)
  const [f, setF] = useState('D')
  const [chartData, setChartData] = useState([])
  const [chartDataLoading, setChartDataLoading] = useState(false)
  const [laykaPrice, setLaykaPrice] = useState(0)
  // const [chartData, setTempData] = useState([])

  const DECIMALS = 10 ** 18

  const laykaLogo = "https://lykacoin.net/pinksale.png"
  const busdLogo = "https://upload.wikimedia.org/wikipedia/commons/f/fc/Binance-coin-bnb-logo.png"

  const { toastError, toastSuccess } = useToast()

  const getBlockData = async (frame) => {
    const blockEndPoint = "https://api.thegraph.com/subgraphs/name/pancakeswap/blocks"
    const currentTimeStamp = Math.round(new Date().getTime() / 1000)
    const timeBoforeTime = currentTimeStamp - (frame * 3600)
    let qstring = ''
    const inc = {
      24: 3600,
      168: 86400,
      720: 86400,
      8760: 86400
    }
    for (let i = timeBoforeTime; i < currentTimeStamp; i += inc[frame]) {
      qstring += `t${i}:blocks(first: 1, orderBy: timestamp, orderDirection: desc, where: { timestamp_gt: ${i}, timestamp_lt: ${i + 600} }) { number },`
    }
    const query = `
      query blocks {
        ${qstring}
      }
    `
    const result = await axios.post(blockEndPoint, { query })
    return result.data.data
  }


  const getTokenPriceData = async (frame, tokenAddress) => {
    const subgraphEndpoint = 'https://proxy-worker-dev.pancake-swap.workers.dev/bsc-exchange'
    const blockData = await getBlockData(frame)
    let qstring = ''
    for (const k in blockData) {
      const key = k
      const value = blockData[k][0]['number']

      qstring += `${key}:token(id:"${tokenAddress}", block: { number: ${value} }) { derivedUSD },`
    }
    const query = `
      query derivedTokenPriceData {
        ${qstring}
      }
    `

    const result = await axios.post(subgraphEndpoint, { query })
    return result.data.data

  }


  useEffect(() => {
    (async () => {
      setChartDataLoading(true)
      const laykaData = await getTokenPriceData(timeFrame, addresses.LAYKA.toLowerCase())

      const dataList = []
      for (const k in laykaData) {
        const key = parseInt(k.slice(1))
        const value = parseFloat(laykaData[k]['derivedUSD'])
        if (timeFrame === 24) {
          const newKey = new Date(key * 1000).toTimeString()
          dataList.push({ time: newKey.slice(0, 5), value: value, tt: key })
        } else if (timeFrame === 24 * 7) {
          const newKey = new Date(key * 1000).toLocaleDateString()
          dataList.push({ time: newKey.slice(0, 5), value: value, tt: key })
        } else if (timeFrame === 24 * 30) {
          const newKey = new Date(key * 1000).toLocaleDateString()
          dataList.push({ time: newKey.slice(0, 5), value: value, tt: key })
        } else {
          const newKey = new Date(key * 1000).toLocaleDateString()
          dataList.push({ time: newKey.slice(0, 5), value: value, tt: key })
        }
        // dataList.push({time: key, value: value})
      }
      const sorted = dataList.sort((a, b) => {
        return a.tt - b.tt;
      });

      let newDataList = sorted.map(d => ({
        time: d.time,
        value: d.value.toFixed(6)
      }));
      setChartData(newDataList)
      setChartDataLoading(false)
    })()
  }, [timeFrame])


  useEffect(() => {
    getLyakaPrice()
      .then(resp => setLaykaPrice(resp))
  }, [])




  useEffect(() => {
    return () => {
      setLaykaAmount('')
      setBusdAmount('')
    }
  }, [])



  useEffect(() => {
    if (active) {

      const laykaContract = loadContract(library.provider, abis.LAYKA, addresses.LAYKA)
      laykaContract.methods.balanceOf(account).
        call()
        .then(resp => setLaykaBalance((resp / DECIMALS).toFixed(4)))

      const busdContract = loadContract(library.provider, abis.BUSD, addresses.BUSD)
      busdContract.methods.balanceOf(account).
        call()
        .then(resp => setBusdBalance((resp / DECIMALS).toFixed(4)))

    }
  }, [active])

  const loadContract = (provider, abi, address) => {
    const web3 = new Web3(provider)
    return new web3.eth.Contract(abi, address)
  }




  const handleSubmit = event => {
    event.preventDefault();
  }

  const [loading, setLoading] = useState(false)
  const [tx, setTx] = useState(undefined)

  useEffect(() => {
    if (!direction && !laykaAmount.length) {
      setBusdAmount('')
    } else if (direction && !busdAmount.length) {
      setLaykaAmount('')
    }
  }, [direction, laykaAmount, busdAmount])

  const getPrice = (value) => {
    !direction ? setLaykaAmount(value) : setBusdAmount(value)
    setShowGasPopup(true)
    if (!value.length) {
      direction ? setLaykaAmount('') : setBusdAmount('')
      setShowGasPopup(false)
    } else {
      setLoading(true)
      getSwapPrice(direction, value, slippage)
        .then(resp => {
          direction ? setLaykaAmount(resp) : setBusdAmount(resp)
          setLoading(false)
        })
    }
  }

  const swapToken = async () => {
    setLoadingTx(true)
    const value = !direction ? laykaAmount : busdAmount
    swap(direction, value, library.provider, account, slippage, toastError, toastSuccess)
      .then(resp => {
        setTx(resp)
        setLoadingTx(false)
        setLaykaAmount('')
        setBusdAmount('')
        setTimeout(() => {
          toggleTransactionModal()
        }, 200)
      })
      .catch(e => {
        setLoadingTx(false)
      })

  }



  const toggleTransactionModal = () => {
    let attr = document.createElement('button')
    attr.setAttribute('data-bs-toggle', 'modal')
    attr.setAttribute('data-bs-target', '#exampleModal')
    document.body.appendChild(attr)
    attr.click()
    attr.remove()
  }

  const handleOnclick = () => {
    if (!direction) {
      if (laykaBalance < laykaAmount && active) {
        toastError('Insufficient funds')
      } else {
        !active ? activate(injected) : toggleTransactionModal()
      }
    } else {
      if (busdBalance < busdAmount && active) {
        toastError('Insufficient funds')
      } else {
        !active ? activate(injected) : toggleTransactionModal()
      }
    }
  }

  const shortenAddress = (address) => {
    return `${address.substring(0, 6)}.........${address.substring(address.length - 4)}`
  }



  return (
    <>
      <div>
        <nav
          className="navbar navbar-expand-lg navbar-dark"
          style={{ backgroundColor: "#120D20" }}
        >
          <div className="container-fluid">
            <a className="navbar-brand" href="#">
              PunkPanda
            </a>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon" />
            </button>
            <div
              className="collapse navbar-collapse"
              id="navbarSupportedContent"
            >
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <a className="nav-link active" aria-current="page" href="#">
                    Home
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">
                    Link
                  </a>
                </li>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="navbarDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Dropdown
                  </a>
                  <ul
                    className="dropdown-menu"
                    aria-labelledby="navbarDropdown"
                  >
                    <li>
                      <a className="dropdown-item" href="#">
                        Action
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="#">
                        Another action
                      </a>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <a className="dropdown-item" href="#">
                        Something else here
                      </a>
                    </li>
                  </ul>
                </li>
                <li className="nav-item">
                  <a className="nav-link disabled">Disabled</a>
                </li>
                <li className="nav-item">
                  <button
                    type="submit"
                    onClick={() => {!active ? activate(injected) : deactivate()}}
                    style={{
                      backgroundColor: "#5D4DA1",
                      width: "100%",
                      padding: 8,
                      borderRadius: 30,
                      fontWeight: "bold",
                      fontSize: 20,
                    }}
                    className="btn btn-primary"
                  >
                    {!active ? 'Connect wallet' : shortenAddress(account)}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <ConfirmTransactionModal
          fromToken={!direction ? 'LAYKA' : 'BUSD'}
          toToken={direction ? 'LAYKA' : 'BUSD'}
          fromValue={!direction ? laykaAmount : busdAmount}
          toValue={direction ? laykaAmount : busdAmount}
          swapToken={swapToken}
          loadingTx={loadingTx}
        />


        <div className="container">
          <div className="row">
            <div className="col-sm-6 mt-5">
              <div>
                <h4 className="text-white">LAYKA/BUSD</h4>
                <h1 style={{ fontWeight: "bold" }} className="text-white">
                  ${laykaPrice}
                </h1>
              </div>

              <button onClick={() => { setTimeFrame(24); setF('D') }} disabled={timeFrame === 24}>24H</button>
              <button onClick={() => { setTimeFrame(24 * 7); setF('W') }} disabled={timeFrame === 24 * 7}>1W</button>
              <button onClick={() => { setTimeFrame(24 * 30); setF('M') }} disabled={timeFrame === 24 * 30}>1M</button>
              <button onClick={() => { setTimeFrame(24 * 365); setF('Y') }} disabled={timeFrame === 24 * 365}>1Y</button>


              <div
                style={{
                  width: "100%",
                  height: "400px",
                }}
              >
                {chartDataLoading ? (
                  <PulseLoader size={30} color={'#ffffff'} />
                ) : (
                  <LineChart chartData={chartData} f={f} />
                )}
              </div>
            </div>
            <div className="col-sm-6 mt-5">

              {showSettings ? (
                <Settings setShowSettings={setShowSettings} setSlippage={setSlippage} slippage={slippage} />
              ) : (
                <div
                  className="container p-5"
                  style={{ backgroundColor: "#120D20" }}
                >
                  <form onSubmit={handleSubmit}>
                    <h4
                      style={{ fontSize: 40 }}
                      className="text-center text-white mt-3"
                    >
                      Swap
                    </h4>
                    <div className="form-group m-4">
                      <div
                        style={{
                          padding: 20,
                          backgroundColor: "#0A0112",
                          borderRadius: 40,
                        }}
                      >
                        <div style={{ display: "flex", gap: 15 }}>
                          <div
                            style={{
                              padding: 10,
                              backgroundColor: "#1A132F",
                              borderRadius: 20,
                              display: "flex",
                              gap: 10,
                              paddingTop: 20,
                            }}
                          >
                            <img
                              src={!direction ? laykaLogo : busdLogo}
                              className="img-fluid"
                              style={{ width: 20, height: 20 }}
                              alt=""
                            />

                            <h6 className="text-white">{!direction ? 'LAYKA' : 'BUSD'}</h6>
                          </div>
                          <h6 style={{ color: "#7F818A" }} className="mt-3">
                            You Pay
                          </h6>
                        </div>

                        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                          <input
                            onChange={(e) => {
                              getPrice(e.target.value)
                            }}
                            value={!direction ? laykaAmount : busdAmount}
                            style={{
                              padding: 10,
                              backgroundColor: "#0A0112",
                              border: "none",
                              color: "white",
                              outline: "none",
                              width: "100%",
                            }}
                            type="number"
                            placeholder="Enter Amount"
                          />
                          <div>
                            <h6 className="mt-3" style={{ color: "#69818B" }}>
                              Balance: {!direction ? laykaBalance : busdBalance}
                            </h6>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginLeft: 40, cursor: 'pointer' }} onClick={() => setDirection(!direction)}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={35}
                        style={{
                          color: "white",
                          backgroundColor: "#0A0112",
                          padding: 5,
                          borderRadius: 50,
                        }}
                        height={35}
                        fill="currentColor"
                        className="bi bi-arrow-down-up"
                        viewBox="0 0 16 16"
                      >
                        <path
                          fillRule="evenodd"
                          d="M11.5 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L11 2.707V14.5a.5.5 0 0 0 .5.5zm-7-14a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L4 13.293V1.5a.5.5 0 0 1 .5-.5z"
                        />
                      </svg>
                    </div>

                    <div className="form-group m-4">
                      <div
                        style={{
                          padding: 20,
                          backgroundColor: "#0A0112",
                          borderRadius: 40,
                        }}
                      >
                        <div style={{ display: "flex", gap: 15 }}>
                          <div
                            style={{
                              padding: 10,
                              backgroundColor: "#1A132F",
                              borderRadius: 20,
                              display: "flex",
                              gap: 10,
                              paddingTop: 20,
                            }}
                          >
                            <img
                              src={direction ? laykaLogo : busdLogo}
                              className="img-fluid"
                              style={{ width: 20, height: 20 }}
                              alt=""
                            />

                            <h6 className="text-white">{direction ? 'LAYKA' : 'BUSD'}</h6>
                          </div>
                          <h6 style={{ color: "#7F818A" }} className="mt-3">
                            You Receive
                          </h6>
                        </div>

                        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                          {loading ? 'loading' : (
                            <input
                              style={{
                                padding: 10,
                                backgroundColor: "#0A0112",
                                border: "none",
                                color: "white",
                                outline: "none",
                                width: "100%",
                              }}
                              type="text"
                              placeholder="Enter BNB"
                              disabled
                              value={direction ? laykaAmount : busdAmount}
                            />
                          )}
                          <div>
                            <h6 className="mt-3" style={{ color: "#69818B" }}>
                              Balance: {direction ? laykaBalance : busdBalance}
                            </h6>
                          </div>
                        </div>
                      </div>
                      {showGasPopup ? (
                        <div
                          style={{
                            backgroundColor: "#1A132F",
                            padding: 20,
                            marginTop: 30,
                            borderRadius: 30,
                          }}
                        >
                          <div className="row">
                            <div className="col">
                              <h6 style={{ color: "#B9B8B8" }}>GAS Price</h6>
                              <h5 style={{ color: "#B9B8B8" }}>
                                {gasPrice}
                                High (204.45 - 273.92 Gwei)
                              </h5>
                              <h6 style={{ color: "#B9B8B8" }}>Slippage Tolerance</h6>
                              <h6 style={{ color: "#B9B8B8" }}>{`${slippage} %`}</h6>

                            </div>
                            <div className="col">
                              <div style={{ textAlign: "right" }}>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  onClick={() => {
                                    setShowSettings(true);
                                  }}
                                  style={{ color: "white", cursor: "pointer" }}
                                  width={26}
                                  height={26}
                                  fill="currentColor"
                                  className="bi bi-gear"
                                  viewBox="0 0 16 16"
                                >
                                  <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z" />
                                  <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <></>
                      )}
                    </div>
                    <div className="container ">
                      <button
                        type="submit"
                        disabled={active ? !direction ? !laykaAmount.length || loading : !busdAmount.length || loading : false}
                        onClick={() => { handleOnclick() }}
                        style={{
                          backgroundColor: "#5D4DA1",
                          width: "100%",
                          padding: 20,
                          borderRadius: 30,
                          fontWeight: "bold",
                          fontSize: 20,
                        }}
                        className="btn btn-primary"
                      >
                        {!active ? 'Connet Wallet' : !direction ? !laykaAmount.length ? 'Enter Amount' : 'Swap' : !busdAmount.length ? 'Enter Amount' : 'Swap'}
                      </button>
                    </div>
                  </form>
                </div>
              )}





            </div>
          </div>
        </div>
        <Toaster position="bottom-right" toastOptions={{ duration: 2000 }} />
      </div>
    </>
  );
};

export default App;
