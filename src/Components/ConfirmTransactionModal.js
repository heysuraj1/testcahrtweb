import React, { useEffect } from 'react'
import BeatLoader  from "react-spinners/BeatLoader"

function ConfirmTransactionModal({fromToken, toToken, fromValue, toValue, swapToken, loadingTx}) {

    return (
        <div
            className="modal fade"
            id="exampleModal"
            tabIndex={-1}
            aria-labelledby="exampleModalLabel"
            aria-hidden="false"
        >
            <div className="modal-dialog modal-dialog-centered">
                <div style={{ borderRadius: 40 }} className="modal-content">
                    <div
                        style={{ backgroundColor: "#120D20", borderRadius: 30 }}
                        className="modal-body p-5"
                    >
                        <div style={{ textAlign: "right" }}>
                            <svg
                            id="demo1"
                                data-bs-toggle="modal"
                                data-bs-target="#exampleModal"
                                xmlns="http://www.w3.org/2000/svg"
                                style={{ color: "white", cursor: "pointer" }}
                                width={16}
                                height={16}
                                fill="currentColor"
                                className="bi bi-x-lg"
                                viewBox="0 0 16 16"
                            >
                                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" />
                            </svg>
                        </div>
                        <h3
                            style={{ fontWeight: "bold" }}
                            className="text-center text-white mb-4"
                        >
                            Confirm Swap
                        </h3>
                        <p className="text-center text-white">
                            By clicking approve you are confirming this transaction
                        </p>

                        <h6 className="text-white">You Pay</h6>

                        <div className="row">
                            <div className="col">
                                <h5 className="text-white">{fromValue}</h5>
                            </div>
                            <div className="col">
                                <h5 className="text-white" style={{ textAlign: "right" }}>
                                    {fromToken}
                                </h5>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col">
                                <hr style={{ color: "white" }} />
                            </div>
                            <div className="col">
                                <div style={{ textAlign: "center" }}>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        style={{ color: "white" }}
                                        width={26}
                                        height={26}
                                        fill="currentColor"
                                        className="bi bi-arrow-down"
                                        viewBox="0 0 16 16"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <div className="col">
                                <hr style={{ color: "white" }} />
                            </div>
                        </div>

                        <h6 className="text-white mt-3">You Receive</h6>

                        <div className="row">
                            <div className="col">
                                <h5 className="text-white">{toValue}</h5>
                            </div>
                            <div className="col">
                                <h5 className="text-white" style={{ textAlign: "right" }}>
                                    {toToken}
                                </h5>
                            </div>
                        </div>

                        <p
                            style={{ fontSize: 15 }}
                            className="text-center text-white container mt-5"
                        >
                            {`Output is estimated. You will receive at least ${toValue} ${toToken} or the transition will revert`}
                        </p>

                        <div className="container ">
                            <button
                                style={{
                                    backgroundColor: "#5D4DA1",
                                    width: "100%",
                                    padding: 20,
                                    borderRadius: 30,
                                    fontWeight: "bold",
                                    fontSize: 20,
                                }}
                                className="btn btn-primary"
                                disabled={loadingTx}
                                onClick={() => {
                                    swapToken()
                                }}
                            >
                                {loadingTx ? <BeatLoader size={20} color={'#ffffff'} /> : "Confirm Swap"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ConfirmTransactionModal