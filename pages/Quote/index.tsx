import useSWR from "swr";
import Image from "next/image";
import {
  ETH_TOKENS_BY_SYMBOL,
  ETH_TOKENS_BY_ADDRESS,
} from "../../lib/constants";
import { fetcher } from "../Price";
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import type { PriceResponse, QuoteResponse } from "../api/types";
import { formatUnits } from "ethers";
import {
  useAccount,
  useSendTransaction,
  usePrepareSendTransaction,
  useWaitForTransaction,
  type Address,
} from "wagmi";
import styles from '../Price/Form.module.css';
import React from 'react';
import { Hash } from "crypto";


// Affiliate fee
const AFFILIATE_FEE = 0.003  ; // Percentage of the buyAmount that should be attributed to feeRecipient as affiliate fees
const FEE_RECIPIENT = "0xD86766b68e844E9096662d0E38Bc6d11e803B7Bb"; // The ETH address that should receive affiliate fees

// QuoteView function
export default function QuoteView({
  price,
  quote,
  setQuote,
  takerAddress,
}: {
  price: PriceResponse;
  quote: QuoteResponse | undefined;
  setQuote: (price: any) => void;
  takerAddress: Address | undefined;
}) {
  const sellTokenInfo = ETH_TOKENS_BY_ADDRESS[price.sellTokenAddress.toLowerCase()];
  const buyTokenInfo = ETH_TOKENS_BY_ADDRESS[price.buyTokenAddress.toLowerCase()];
  const isNativeToken = sellTokenInfo.symbol.toLowerCase() === "eth"; // Check if the sell token is eth

  // Fetch quote here
  const { address } = useAccount();
  const router = useRouter();

  const { isLoading: isLoadingPrice } = useSWR(
    [
      "/api/quote",
      {
        sellToken: price.sellTokenAddress,
        buyToken: price.buyTokenAddress,
        sellAmount: price.sellAmount,
        takerAddress,
        feeRecipient: FEE_RECIPIENT,
        buyTokenPercentageFee: AFFILIATE_FEE,
      },
    ],
    fetcher,
    {
      onSuccess: (data) => {
        setQuote(data);
        console.log("quote", data);
        console.log(formatUnits(data.buyAmount, buyTokenInfo.decimals), data);
      },
    },
  );

  // Prepare transaction configuration
  const config = isNativeToken
    ? {
        to: quote?.to,  // 0x Exchange Proxy contract address
        value: quote?.sellAmount ? BigInt(quote.sellAmount) : 0n, // Set the eth value
        data: quote?.data, // This should contain the correct encoded function call for the swap
      }
    : {
        to: quote?.to,
        value: undefined,
        data: quote?.data, // ERC-20 transactions rely on the data field
      };

      const { sendTransaction, data: transactionData, isError: transactionError } = useSendTransaction(config);
      const [transactionStatus, setTransactionStatus] = useState<'idle' | 'pending' | 'success' | 'error' | 'rejected'>('idle');
      const [popupVisible, setPopupVisible] = useState(false);
      const [transactionHash, setTransactionHash] = useState<string | undefined>(undefined);
      
      const handlePlaceOrder = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
      
        console.log("Attempting to send transaction...");
      
        if (!sendTransaction) {
          console.error("Transaction not prepared");
          return;
        }
        setTransactionStatus('pending');
        setPopupVisible(true);
      
        try {
          await sendTransaction(); // Await to properly catch errors
        } catch (error: any) {
          console.error("Transaction error:", error);
      
          if (error.name === 'TransactionExecutionError' || error.message.includes('rejected')) {  // MetaMask user rejection error
            setTransactionStatus('rejected');
          } else {
            setTransactionStatus('error');
          }
      
          setTransactionHash(undefined); // Clear transaction hash on rejection or error
        }
      };
      
       
      useEffect(() => {
      if (transactionData?.hash) {
        setTransactionHash(transactionData.hash);
        setPopupVisible(true); // show popup immediately
      }
    
      if (transactionError) {
        setTransactionStatus('error');
        setPopupVisible(true); // also show on error
      }
    }, [transactionData, transactionError]);
      
      const { status, error } = useWaitForTransaction({
        hash: transactionData?.hash,
      });
      
      useEffect(() => {
        if (status === 'success') {
          setTransactionStatus('success');
        } else if (status === 'error') {
          setTransactionStatus('error');
        } else if (error) {
          setTransactionStatus('error');
        }
      }, [status, error]);
      
      const handleClose = () => {
        setPopupVisible(false);
        setTransactionStatus('idle');
        setTransactionHash(undefined);
        router.reload();
      };
      

  if (!quote) {
    return <div style={{ color: 'white', fontWeight: 'bold' }}>Getting Final quote...</div>;
  }

  return (
    <div className="p-3 mx-auto max-w-screen-sm ">
      <button
        className="bg-dark-200 text-white text-xl font-bold py-2 px-4 rounded mt-4"
        onClick={() => {
          router.reload();
        }}
      >
        Go Back
      </button>
      <form className={styles.form}>
        <div>
          <div className="text-xl mb-2 text-white">You pay</div>
          <div className="flex items-center text-lg sm:text-3xl mb-4 text-white">
            <img
              alt={sellTokenInfo.symbol}
              className="h-9 w-9 mr-2 rounded-md"
              src={sellTokenInfo.logoURI}
            />
            <span>{quote.sellAmount && sellTokenInfo.decimals !== undefined ? formatUnits(BigInt(quote.sellAmount), sellTokenInfo.decimals) : 'Invalid Amount'}</span>
            <div className="ml-2">{sellTokenInfo.symbol}</div>
          </div>
        </div>

        <div>
          <div className="text-xl mb-2 text-white">You receive</div>
          <div className="flex items-center text-lg sm:text-3xl mb-4 text-white">
            <img
              alt={buyTokenInfo.symbol}
              className="h-9 w-9 mr-2 rounded-md"
              src={buyTokenInfo.logoURI}
            />
            <span>{quote.buyAmount && buyTokenInfo.decimals !== undefined ? Number(formatUnits(BigInt(quote.buyAmount), buyTokenInfo.decimals)).toFixed(2) : 'Invalid Amount'}</span>
            <div className="ml-2">{buyTokenInfo.symbol}</div>
          </div>
        </div>
        <div>
          <div className="text-white mb-3 ">
            {quote && quote.grossBuyAmount
              ? "Fee: " +
                (quote.grossBuyAmount && buyTokenInfo.decimals !== undefined ? (Number(formatUnits(BigInt(quote.grossBuyAmount), buyTokenInfo.decimals))*AFFILIATE_FEE).toFixed(1) : 'Invalid Amount') +
                " " +
                buyTokenInfo.symbol
              : null}
          </div>
        </div>
        <button
        className={styles.button}
        onClick={handlePlaceOrder}
        disabled={transactionStatus === 'pending' || transactionStatus === 'success'}
      >
        {transactionStatus === 'pending' && "Swapping..."}
        {transactionStatus === 'success' && "Swap Completed"}
        {transactionStatus === 'error' && "Swap Failed"}
        {transactionStatus === 'rejected' && "Swap Rejected"}
        {transactionStatus === 'idle' && "Swap"}
      </button>
      </form>

      {transactionHash && (
  <div className="popup">
    <a
      href={`https://bscscan.com/tx/${transactionHash}`}
      target="_blank"
      rel="noopener noreferrer"
      className="external-link"
    >
      View Transaction ↗
    </a>
    <button className="close-button" onClick={handleClose}>Close</button>
  </div>
)}


<style jsx>{`
  .popup {
    position: fixed;
    top: 20px;
    right: 20px;
    background: #1f1f1f;
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    z-index: 999;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .external-link {
    font-size: 16px;
    color: #4fc3f7;
    font-weight: bold;
    text-decoration: underline;
    cursor: pointer;
  }

  .close-button {
    align-self: flex-end;
    padding: 4px 12px;
    font-size: 14px;
    background-color: #333;
    border: none;
    border-radius: 6px;
    color: white;
    cursor: pointer;
  }

  .close-button:hover {
    background-color: #444;
  }
`}</style>

    </div>
  );
}
