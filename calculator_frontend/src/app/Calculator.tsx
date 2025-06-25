"use client";

import React, { useState, useEffect } from "react";
import {
  Calculator,
  Wallet,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Clock,
  Copy,
} from "lucide-react";

// Solana Web3 integration constants
const SOLANA_NETWORK = "devnet"; // Change to 'mainnet-beta' for production
const CALCULATOR_PROGRAM_ID = "YourProgramIdHere"; // Replace with your actual program ID

export default function SolanaCalculatorDApp() {
  // Connection and wallet state
  const [wallet, setWallet] = useState(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [balance, setBalance] = useState(0);

  // Calculator state
  const [operand1, setOperand1] = useState("");
  const [operand2, setOperand2] = useState("");
  const [operation, setOperation] = useState("add");
  const [result, setResult] = useState(null);

  // Transaction state
  const [isProcessing, setIsProcessing] = useState(false);
  const [txSignature, setTxSignature] = useState("");
  const [txStatus, setTxStatus] = useState(""); // 'pending', 'confirmed', 'failed'
  const [error, setError] = useState("");

  // Check if Phantom wallet is available
  const getProvider = () => {
    if ("phantom" in window) {
      const provider = window.phantom?.solana;
      if (provider?.isPhantom) {
        return provider;
      }
    }
    return null;
  };

  // Connect to Phantom wallet
  const connectWallet = async () => {
    const provider = getProvider();
    if (!provider) {
      setError(
        "Phantom wallet not found. Please install Phantom wallet extension."
      );
      return;
    }

    try {
      setConnecting(true);
      setError("");

      const response = await provider.connect();
      setWallet(provider);
      setConnected(true);

      // Get wallet balance
      await updateBalance(response.publicKey);
    } catch (err) {
      console.error("Failed to connect wallet:", err);
      setError("Failed to connect wallet. Please try again.");
    } finally {
      setConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = async () => {
    const provider = getProvider();
    if (provider) {
      try {
        await provider.disconnect();
      } catch (err) {
        console.error("Error disconnecting:", err);
      }
    }

    setWallet(null);
    setConnected(false);
    setBalance(0);
    clearCalculation();
  };

  // Update wallet balance
  const updateBalance = async (publicKey) => {
    try {
      // This would typically use @solana/web3.js Connection
      // const connection = new Connection(clusterApiUrl(SOLANA_NETWORK));
      // const balance = await connection.getBalance(publicKey);
      // setBalance(balance / LAMPORTS_PER_SOL);

      // Mock balance for now
      setBalance(1.5432); // SOL
    } catch (err) {
      console.error("Failed to get balance:", err);
    }
  };

  // Perform calculation on Solana
  const performCalculation = async () => {
    if (!connected || !wallet) {
      setError("Please connect your wallet first");
      return;
    }

    if (!operand1 || !operand2) {
      setError("Please enter both operands");
      return;
    }

    const num1 = parseFloat(operand1);
    const num2 = parseFloat(operand2);

    if (isNaN(num1) || isNaN(num2)) {
      setError("Please enter valid numbers");
      return;
    }

    if (operation === "divide" && num2 === 0) {
      setError("Division by zero is not allowed");
      return;
    }

    try {
      setIsProcessing(true);
      setError("");
      setTxSignature("");
      setTxStatus("");
      setResult(null);

      // Here you would integrate with your Solana program
      // const transaction = new Transaction();
      // const instruction = createCalculatorInstruction({
      //   operand1: num1,
      //   operand2: num2,
      //   operation: operation,
      //   calculatorAccount: calculatorAccountPubkey,
      //   userAccount: wallet.publicKey,
      //   systemProgram: SystemProgram.programId,
      // });
      // transaction.add(instruction);

      // const signature = await wallet.signAndSendTransaction(transaction);
      // setTxSignature(signature);
      // setTxStatus('pending');

      // Mock transaction simulation
      const mockSignature = generateMockSignature();
      setTxSignature(mockSignature);
      setTxStatus("pending");

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Calculate result (this would come from your program)
      let calcResult;
      switch (operation) {
        case "add":
          calcResult = num1 + num2;
          break;
        case "subtract":
          calcResult = num1 - num2;
          break;
        case "multiply":
          calcResult = num1 * num2;
          break;
        case "divide":
          calcResult = num1 / num2;
          break;
        default:
          throw new Error("Invalid operation");
      }

      setResult(calcResult);
      setTxStatus("confirmed");
    } catch (err) {
      console.error("Calculation failed:", err);
      setError(err.message || "Transaction failed. Please try again.");
      setTxStatus("failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const clearCalculation = () => {
    setOperand1("");
    setOperand2("");
    setResult(null);
    setTxSignature("");
    setTxStatus("");
    setError("");
  };

  const generateMockSignature = () => {
    const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    let result = "";
    for (let i = 0; i < 88; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getOperationSymbol = (op) => {
    const symbols = { add: "+", subtract: "−", multiply: "×", divide: "÷" };
    return symbols[op] || "+";
  };

  const getExplorerUrl = (signature) => {
    return `https://explorer.solana.com/tx/${signature}?cluster=${SOLANA_NETWORK}`;
  };

  // Auto-connect on page load if previously connected
  useEffect(() => {
    const provider = getProvider();
    if (provider) {
      provider.on("connect", () => {
        setWallet(provider);
        setConnected(true);
      });

      provider.on("disconnect", () => {
        setWallet(null);
        setConnected(false);
        setBalance(0);
      });

      // Try to eagerly connect
      provider.connect({ onlyIfTrusted: true }).catch(() => {
        // User hasn't approved this website before
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Calculator className="h-8 w-8 text-indigo-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">
                Solana Calculator
              </h1>
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {SOLANA_NETWORK}
              </span>
            </div>

            {/* Wallet Connection */}
            <div className="flex items-center space-x-4">
              {connected ? (
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {wallet?.publicKey?.toString().slice(0, 4)}...
                      {wallet?.publicKey?.toString().slice(-4)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {balance.toFixed(4)} SOL
                    </div>
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  disabled={connecting}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  {connecting ? "Connecting..." : "Connect Wallet"}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calculator Input */}
          <div className="bg-white shadow-lg rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Calculator Input
              </h2>
              <p className="text-sm text-gray-500">
                Perform calculations on the Solana blockchain
              </p>
            </div>

            <div className="p-6 space-y-6 text-black">
              {/* First Operand */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Operand
                </label>
                <input
                  type="number"
                  step="any"
                  value={operand1}
                  onChange={(e) => setOperand1(e.target.value)}
                  placeholder="Enter first number"
                  disabled={!connected}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Operation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Operation
                </label>
                <select
                  value={operation}
                  onChange={(e) => setOperation(e.target.value)}
                  disabled={!connected}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="add">Addition (+)</option>
                  <option value="subtract">Subtraction (−)</option>
                  <option value="multiply">Multiplication (×)</option>
                  <option value="divide">Division (÷)</option>
                </select>
              </div>

              {/* Second Operand */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Second Operand
                </label>
                <input
                  type="number"
                  step="any"
                  value={operand2}
                  onChange={(e) => setOperand2(e.target.value)}
                  placeholder="Enter second number"
                  disabled={!connected}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 text-black">
                <button
                  onClick={performCalculation}
                  disabled={
                    !connected || isProcessing || !operand1 || !operand2
                  }
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculate
                    </>
                  )}
                </button>

                <button
                  onClick={clearCalculation}
                  disabled={!connected}
                  className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear
                </button>
              </div>

              {/* Error Display */}
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Error
                      </h3>
                      <div className="mt-2 text-sm text-red-700">{error}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results and Transaction Info */}
          <div className="space-y-6 text-black">
            {/* Calculation Expression */}
            {(operand1 || operand2) && (
              <div className="bg-white shadow-lg rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Calculation
                </h3>
                <div className="text-2xl font-mono text-center py-4 bg-gray-50 rounded-lg">
                  {operand1 || "?"} {getOperationSymbol(operation)}{" "}
                  {operand2 || "?"}
                  {result !== null && (
                    <span className="text-indigo-600"> = {result}</span>
                  )}
                </div>
              </div>
            )}

            {/* Result Display */}
            {result !== null && (
              <div className="bg-white shadow-lg rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Result</h3>
                </div>
                <div className="text-4xl font-bold text-center text-indigo-600 py-6 bg-indigo-50 rounded-lg">
                  {result}
                </div>
              </div>
            )}

            {/* Transaction Status */}
            {txSignature && (
              <div className="bg-white shadow-lg rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Transaction Details
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      Status
                    </span>
                    <div className="flex items-center">
                      {txStatus === "pending" && (
                        <>
                          <Clock className="h-4 w-4 text-yellow-500 mr-1 animate-spin" />
                          <span className="text-yellow-700">Confirming...</span>
                        </>
                      )}
                      {txStatus === "confirmed" && (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-green-700">Confirmed</span>
                        </>
                      )}
                      {txStatus === "failed" && (
                        <>
                          <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                          <span className="text-red-700">Failed</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-500">
                        Transaction Signature
                      </span>
                      <button
                        onClick={() => copyToClipboard(txSignature)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="bg-gray-50 rounded-md p-3">
                      <code className="text-xs text-gray-800 break-all">
                        {txSignature}
                      </code>
                    </div>
                  </div>

                  <a
                    href={getExplorerUrl(txSignature)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    View on Solana Explorer
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                </div>
              </div>
            )}

            {/* Connection Required */}
            {!connected && (
              <div className="bg-white shadow-lg rounded-lg p-6">
                <div className="text-center">
                  <Wallet className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Wallet Required
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Connect your Solana wallet to perform calculations on-chain
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={connectWallet}
                      disabled={connecting}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      Connect Phantom Wallet
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Integration Instructions */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">
            Smart Contract Integration
          </h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>
              <strong>To integrate your Rust calculator program:</strong>
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Install dependencies:{" "}
                <code className="bg-blue-100 px-1 rounded">
                  npm install @solana/web3.js @solana/wallet-adapter-react
                  @solana/wallet-adapter-wallets
                </code>
              </li>
              <li>
                Replace{" "}
                <code className="bg-blue-100 px-1 rounded">
                  CALCULATOR_PROGRAM_ID
                </code>{" "}
                with your deployed program ID
              </li>
              <li>
                Update the{" "}
                <code className="bg-blue-100 px-1 rounded">
                  performCalculation
                </code>{" "}
                function to create proper Solana instructions
              </li>
              <li>
                Add your program's instruction data encoding/decoding logic
              </li>
              <li>Handle account creation and rent-exemption if needed</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
