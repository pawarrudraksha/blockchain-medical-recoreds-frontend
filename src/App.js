import React, { useState, useEffect } from "react";
import Web3 from "web3";
import MedicalRecordsContract from "./contracts/MedicalRecords.json";
import "./App.css";

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [patientName, setPatientName] = useState("");
  const [medicalData, setMedicalData] = useState("");
  const [records, setRecords] = useState([]);

  // Load Web3 and MetaMask account
  useEffect(() => {
    async function loadBlockchainData() {
      if (typeof window.ethereum !== "undefined") {
        const web3 = new Web3(window.ethereum);

        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });
        } catch (error) {
          console.error("User denied account access.");
        }

        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);

        const networkId = await web3.eth.net.getId();
        const networkData = MedicalRecordsContract.networks[networkId];

        if (networkData) {
          const contractInstance = new web3.eth.Contract(
            MedicalRecordsContract.abi,
            networkData.address
          );
          setContract(contractInstance);

          const recordCount = await contractInstance.methods
            .recordCount()
            .call();
          const recordsArray = [];
          for (let i = 1; i <= recordCount; i++) {
            const record = await contractInstance.methods.records(i).call();
            recordsArray.push(record);
          }
          setRecords(recordsArray);
        } else {
          window.alert("Smart contract not deployed to detected network.");
        }
      } else {
        window.alert("Please install MetaMask!");
      }
    }

    loadBlockchainData();
  }, []);

  const addRecord = async () => {
    if (contract) {
      await contract.methods
        .addRecord(patientName, medicalData)
        .send({ from: account });
      setPatientName("");
      setMedicalData("");
    }
  };

  return (
    <div className="container">
      <h1>Blockchain Medical Records</h1>
      <p className="account">Connected Account: {account}</p>

      <div className="form">
        <input
          type="text"
          placeholder="Enter Patient Name"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
        />
        <textarea
          placeholder="Enter Medical Data"
          value={medicalData}
          onChange={(e) => setMedicalData(e.target.value)}
        ></textarea>
        <button onClick={addRecord}>Add Record</button>
      </div>

      <h2>Existing Records</h2>
      <div className="record-cards">
        {records.length === 0 && <p>No records found.</p>}
        {records.map((record, index) => (
          <div key={index} className="record-card">
            <h3>{record.patientName}</h3>
            <p>
              <strong>Doctor:</strong> {record.doctor}
            </p>
            <p>
              <strong>Medical Data:</strong> {record.medicalData}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
