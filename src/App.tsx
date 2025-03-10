import { IntMaxClient } from "intmax2-client-sdk";
import { useState, useEffect } from "react";


const initializeClient = async () => {
  const client = await IntMaxClient.init({
    environment: "testnet",
  });
  return client;
};


export default function App() {
  const [client, setClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [intmaxAddress, setIntmaxAddress] = useState("0x123...abcd");
  const [amount, setAmount] = useState(""); // Store input value in state
  const [ethBalance, setEthBalance] = useState("0.00 ETH");
  const [transferAmount, setTransferAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [assetType, setAssetType] = useState("ETH");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const setupClient = async () => {
      const initializedClient = await initializeClient();
      setClient(initializedClient);
    };

    setupClient();
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    console.log("newAmount:", amount)
  };

  const handleLogin = async () => {
    if (!client) {
      console.error("Client not initialized yet.");
      return;
    }

    await client.login();

    // ✅ Store values in variables before setting state
    const isLoggedIn = client.isLoggedIn;
    const walletAddress = client.address;
    const balances = client.tokenBalances;

    setConnected(isLoggedIn);
    setIntmaxAddress(walletAddress);

    console.log("token balances:", balances);
  };

  const handleDeposit = async () => {
    if (!client) {
      console.error("Client not initialized yet.");
      return;
    }
  
    try {
      const tokens = await client.getTokensList();
      console.log("Tokens List:", tokens); // Debugging
  
      if (!Array.isArray(tokens)) {
        console.error("Tokens list is not an array:", tokens);
        alert("Failed to retrieve tokens list.");
        return;
      }
  
      const token = tokens.find((token) => token.symbol === "ETH");
  
      if (!token) {
        console.error("ETH token not found in the list:", tokens);
        alert("ETH token not found.");
        return;
      }
  
      if (typeof token.decimals !== "number") {
        console.error("Token decimals is missing or invalid:", token);
        alert("Invalid token decimals.");
        return;
      }
  
      if (!intmaxAddress) {
        alert("INTMAX address is missing.");
        return;
      }
  
      const parsedAmount = Number(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        alert("Please enter a valid amount.");
        return;
      }
  
  
      const formattedAmount = BigInt(Math.round(parsedAmount * 10 ** token.decimals));
  
      const depositParams = { amount: formattedAmount, token, intmaxAddress };
      console.log("Deposit Parameters:", depositParams);
  
      const { txHash, status } = await client.deposit(depositParams);
      console.log("Transaction Response:", { txHash, status });
  
      alert(`Transaction Submitted! Hash: ${txHash}, Status: ${status}`);

      
    } catch (error) {
      console.error("Error processing deposit:", error);
  
      if (error.stack) {
        console.error("Stack trace:", error.stack);
      }
    
      alert(`Deposit failed: ${error.message}`);
    }
  };
  
  const verify = async () => {
    if (!client) {
      console.error("Client not initialized yet.");
      return;
    }
    const message = 'Hello, World!';
    const signature = await client.signMessage(message);

    const isVerified = await client.verifySignature(signature, message);
    console.log("isVerified", isVerified);

    console.log("signature", signature);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 via-purple-800 to-indigo-900 text-white font-sans">
      {/* Navbar */}
      <nav className="flex flex-col md:flex-row justify-between items-center p-4 bg-white bg-opacity-10 shadow-lg rounded-lg space-y-4 md:space-y-0">
        <h1 className="text-2xl font-extrabold text-center md:text-left text-yellow-400">BUY ME A CUP OF JUICE</h1>
        <div className="space-x-4 flex flex-col md:flex-row">
          <button onClick={() => scrollToSection("connect-section")} className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded transition duration-300"> {connected ? "Connected" : "Connect to Intmax2"}</button>
          <button onClick={() => scrollToSection("get-eth-section")} className="px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-bold rounded transition duration-300">Get ETH INTMAX</button>
        </div>
      </nav>

      {/* Sections */}
      <section id="connect-section" className="min-h-screen md:h-screen flex flex-col justify-center items-center text-center p-6">
        <h2 className="text-4xl font-bold">Buy Me a Cup of Juice</h2>
        <p className="text-gray-300 mt-4">A simple way to get donations from fans on the INTMAX protocol.</p>
        <button className="mt-6 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition duration-300" onClick={handleLogin}> {connected ? "Connected" : "Connect to Intmax2"}</button>
      </section>

      <section id="get-eth-section" className="min-h-screen md:h-screen flex flex-col justify-center items-center text-center p-6 bg-white bg-opacity-10 shadow-lg rounded-md w-full">
        <h3 className="text-xl font-semibold text-yellow-400">Share Intmax2 Address for Some Juice</h3>
        <div className="flex items-center justify-between mt-4 p-3 bg-gray-700 rounded-lg text-gray-200 w-full md:w-2/3">
          <span className="truncate w-4/5">{intmaxAddress}</span>
          <button className="text-yellow-400 text-xl">📋</button>
        </div>
        <ul className="list-disc pl-5 mt-4 text-gray-300 text-left">
          <li>Get ETH INTMAX</li>
          <li>Transfer to friend</li>
        </ul>
      </section>

      <section className="min-h-screen md:h-screen flex flex-col justify-center items-center text-center p-6 bg-white bg-opacity-10 shadow-lg rounded-md w-full">
        <h3 className="text-xl font-semibold text-yellow-400">Transfer ETH or Tokens</h3>
        <div className="mt-4">
          <label className="block text-gray-200">Select Asset Type</label>
          <select className="w-full md:w-2/3 p-2 border rounded mt-2 text-black">
            <option>ETH</option>
            <option>ERC20 Token</option>
            <option>NFT</option>
          </select>
        </div>
        <div className="mt-4">
          <label className="block text-gray-200">Amount</label>
          <input
            type="text"
            value={amount}
            onChange={handleAmountChange}
            className="w-full md:w-2/3 p-2 border rounded mt-2 text-black" />
        </div>
        <div className="mt-4 flex items-center justify-between w-full md:w-2/3 text-gray-200">
          <p>Balance: {ethBalance}</p>
          <button className="text-yellow-400 text-xl">🔄</button>
        </div>
        <button className="mt-6 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition duration-300 w-full md:w-2/3" onClick={handleDeposit}>Deposit </button>
      </section>

      <section className="min-h-screen md:h-screen flex flex-col justify-center items-center text-center p-6 bg-white bg-opacity-10 shadow-lg rounded-md w-full">
        <h3 className="text-xl font-semibold text-yellow-400">Transfer Funds</h3>
        <div className="mt-4">
          <label className="block text-gray-200">Recipient Address</label>
          <input type="text" className="w-full md:w-2/3 p-2 border rounded mt-2 text-black" />
        </div>
        <div className="mt-4">
          <label className="block text-gray-200">Amount</label>
          <input type="text" className="w-full md:w-2/3 p-2 border rounded mt-2 text-black" />
        </div>
        <button className="mt-6 px-6 py-3 bg-green-500 hover:bg-green-400 text-black font-bold rounded-lg transition duration-300 w-full md:w-2/3" onClick={verify}>Transfer</button>
        {message && <p className="mt-4 text-gray-300">{message}</p>}
      </section>
    </div>
  );
}
