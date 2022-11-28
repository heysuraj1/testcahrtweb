import React from "react";

const Settings = ({ setShowSettings, setSlippage, slippage }) => {

  return (
    <div>
      <div style={{ backgroundColor: "#120D20", padding: 30 }}>
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{ color: "white", cursor: "pointer" }}
            onClick={() => {setShowSettings(false)}}
            width={26}
            height={26}
            fill="currentColor"
            className="bi bi-arrow-left"
            viewBox="0 0 16 16"
          >
            <path
              fillRule="evenodd"
              d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"
            />
          </svg>
        </div>
        <h1 className="text-center text-white">Settings</h1>
        <h6 className="text-white">Slippage tolerance</h6>

        <div className="row mt-4">
          <div className="col">
            <div style={{ textAlign: "center" }}>
              <input
                placeholder="1%"
                value={slippage}
                onChange={e => setSlippage(e.target.value)}
                style={{
                  backgroundColor: "#0A0112",
                  outline: "none",
                  color: "white",
                  padding: 10,
                  borderRadius: 30,
                  paddingLeft: 8,
                  borderColor: "#3C56B4",
                }}
                type="number"
              />
            </div>
          </div>
          <div className="col">
            <div style={{ textAlign: "center" }}>
              <button
                style={{
                  backgroundColor: "#0A0112",
                  outline: "none",
                  color: "white",
                  borderRadius: 30,
                  paddingLeft: 8,
                  borderColor: "#3C56B4",
                  width: "100%",
                  padding: 10,
                }}
                type="text"
              >
                Auto
              </button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 40 }} className="container">
          <div
            style={{
              backgroundColor: "#0A0112",
              margin: 10,
              padding: 20,
              paddingLeft: 50,
              width: "100%",
            }}
            className="form-check"
          >
            <input
              className="form-check-input"
              type="radio"
              name="flexRadioDefault"
              id="flexRadioDefault1"
              defaultChecked
            />
            <label
              className="form-check-label text-white"
              htmlFor="flexRadioDefault1"
            >
              Instant
            </label>
          </div>
          <div
            style={{
              backgroundColor: "#0A0112",
              margin: 10,
              padding: 20,
              paddingLeft: 50,
              width: "100%",
            }}
            className="form-check"
          >
            <input
              className="form-check-input"
              type="radio"
              name="flexRadioDefault"
              id="flexRadioDefault2"
            />
            <label
              className="form-check-label text-white"
              htmlFor="flexRadioDefault2"
            >
              High
            </label>
          </div>
          <div
            style={{
              backgroundColor: "#0A0112",
              margin: 10,
              padding: 20,
              paddingLeft: 50,
              width: "100%",
            }}
            className="form-check"
          >
            <input
              className="form-check-input"
              type="radio"
              name="flexRadioDefault"
              id="flexRadioDefault2"
            />
            <label
              className="form-check-label text-white"
              htmlFor="flexRadioDefault2"
            >
              Medium
            </label>
          </div>
          <div
            style={{
              backgroundColor: "#0A0112",
              margin: 10,
              padding: 20,
              paddingLeft: 50,
              width: "100%",
            }}
            className="form-check"
          >
            <input
              className="form-check-input"
              type="radio"
              name="flexRadioDefault"
              id="flexRadioDefault2"
            />
            <label
              className="form-check-label text-white"
              htmlFor="flexRadioDefault2"
            >
              Low
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
