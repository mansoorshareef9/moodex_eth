import qs from "qs";
import React from 'react';
import { useMemo } from "react";
import useSWR from "swr";
import { ConnectKitButton } from "connectkit";
import { useEffect, useState, ChangeEvent } from "react";
import { ethers } from "ethers";
import styles from './Form.module.css';
import { formatUnits, parseUnits } from "ethers";
import {
  erc20ABI,
  useContractRead,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useBalance,
  type Address,
} from "wagmi";
import {
  ETH_TOKENS,
  ETH_TOKENS_BY_SYMBOL,
  ETH_TOKENS_BY_ADDRESS,
  MAX_ALLOWANCE,
  exchangeProxy,
} from "../../lib/constants";

export interface PriceRequestParams {
  sellToken: string;
  buyToken: string;
  buyAmount?: string;
  sellAmount?: string;
  takerAddress?: string;
}


const AFFILIATE_FEE = 0.003; // Percentage of the buyAmount that should be attributed to feeRecipient as affiliate fees
const FEE_RECIPIENT = "0xD86766b68e844E9096662d0E38Bc6d11e803B7Bb"; // The ETH address that should receive affiliate fees
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";


export const fetcher = ([endpoint, params]: [string, PriceRequestParams]) => {
  const { sellAmount, buyAmount } = params;
  if (!sellAmount && !buyAmount) return;
  const query = qs.stringify(params);

  return fetch(`${endpoint}?${query}`).then((res) => res.json());
};


export default function PriceView({
  price,
  setPrice,
  setFinalize,
  takerAddress,
}: {
  price: any;
  setPrice: (price: any) => void;
  setFinalize: (finalize: boolean) => void;
  takerAddress: Address | undefined;
}) {
  const [sellAmount, setSellAmount] = useState("");
  const [buyAmount, setBuyAmount] = useState("");
  const [tradeDirection, setTradeDirection] = useState("sell");
  const [sellToken, setSellToken] = useState("usdc");
  const [buyToken, setBuyToken] = useState("usdt");

  const handleSellTokenChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSellToken(e.target.value);
  };

  function handleBuyTokenChange(e: ChangeEvent<HTMLSelectElement>) {
    setBuyToken(e.target.value);
  };
//  
const selectedSellToken = ETH_TOKENS_BY_SYMBOL[sellToken.toLowerCase()];
const selectedBuyToken = ETH_TOKENS_BY_SYMBOL[buyToken.toLowerCase()];

  
const { data: sellRawBalance, error: sellBalanceError } = useContractRead({
  address: selectedSellToken?.address as `0x${string}`,
  abi: erc20ABI,
  functionName: "balanceOf",
  args: [takerAddress as `0x${string}`],
  chainId: 1,
  enabled: !!takerAddress && !!selectedSellToken && !selectedSellToken.isNative,
});

  
const { data: buyRawBalance, error: buyBalanceError  } = useContractRead({
  address: selectedBuyToken?.address as `0x${string}`,
  abi: erc20ABI,
  functionName: "balanceOf",
  args: [takerAddress as `0x${string}`],
  chainId: 1,
  enabled: !!takerAddress && !!selectedBuyToken && !selectedBuyToken.isNative,
});

  useEffect(() => {
  if (sellBalanceError) console.error("Sell Balance Error:", sellBalanceError);
  if (buyBalanceError) console.error("Buy Balance Error:", buyBalanceError);
}, [sellBalanceError, buyBalanceError]);

  
//
  //click on balance amount
  const handleBalanceClick = () => {
  if (sellRawBalance) {
    const fullBalance = formatUnits(sellRawBalance, ETH_TOKENS_BY_SYMBOL[sellToken].decimals);
    setSellAmount(fullBalance); 
  }
};
/*
  useEffect(() => {
  console.log("Sell Token:", sellToken);
  console.log("Sell Token Address:", sellToken === "eth" ? "native" : ETH_TOKENS_BY_SYMBOL[sellToken]?.address);
  console.log("Sell Token Balance Response:", sellRawBalance);
}, [sellRawBalance, sellToken]);

  useEffect(() => {
  console.log("takerAddress:", takerAddress);
}, [takerAddress]);
*/

  const toggleTokens = () => {
    // Swap tokens and amounts
    setSellToken(prevSellToken => {
      const newBuyToken = buyToken;
      setBuyToken(prevSellToken);
      return newBuyToken;
    });
    setSellAmount(prevSellAmount => {
      const newBuyAmount = buyAmount;
      setBuyAmount(prevSellAmount);
      return newBuyAmount;
    });
  };

  const sellTokenDecimals = ETH_TOKENS_BY_SYMBOL[sellToken].decimals;

  const parsedSellAmount =
    sellAmount && tradeDirection === "sell"
      ? parseUnits(sellAmount, sellTokenDecimals).toString()
      : undefined;

  const buyTokenDecimals = ETH_TOKENS_BY_SYMBOL[buyToken].decimals;

  const parsedBuyAmount =
    buyAmount && tradeDirection === "buy"
      ? parseUnits(buyAmount, buyTokenDecimals).toString()
      : undefined;

  // fetch price here
  const { isLoading: isLoadingPrice } = useSWR(
    [
      "/api/price",
      {
        sellToken: ETH_TOKENS_BY_SYMBOL[sellToken].address,
        buyToken: ETH_TOKENS_BY_SYMBOL[buyToken].address,
        sellAmount: parsedSellAmount,
        buyAmount: parsedBuyAmount,
        takerAddress,
        feeRecipient: FEE_RECIPIENT,
        buyTokenPercentageFee: AFFILIATE_FEE,
      },
    ],
    fetcher,
    {
      onSuccess: (data) => {
        setPrice(data);
        if (tradeDirection === "sell") {
          setBuyAmount(formatUnits(data.buyAmount, buyTokenDecimals));
        } else {
          setSellAmount(formatUnits(data.sellAmount, sellTokenDecimals));
        }
      },
    },
  );


const disabled =
  sellRawBalance && sellAmount
    ? parseUnits(sellAmount, sellTokenDecimals) > BigInt(sellRawBalance)
    : !sellRawBalance || !sellAmount || isNaN(Number(sellAmount));


  // Format and round the balances to 1 decimal place
const formattedSellTokenBalance = sellRawBalance? Number(formatUnits(sellRawBalance, selectedSellToken?.decimals ?? 18)).toFixed(2): "0.00";  
const formattedBuyTokenBalance = buyRawBalance? Number(formatUnits(buyRawBalance, selectedBuyToken?.decimals ?? 18)).toFixed(2): "0.00";

  return (
    <form className={styles.form}>
      <div className="p-4 rounded-md mb-4">
        <section className={styles.tokenSection}>
          <label htmlFor="sell-select" className="sr-only"></label>
          <img
            alt={sellToken}
            className={styles.tokenImage}
            src={ETH_TOKENS_BY_SYMBOL[sellToken].logoURI}
          />
          <div className="sm:w-full sm:mr-2">
            <select
              value={sellToken}
              name="sell-token-select"
              id="sell-token-select"
              className={styles.select}
              onChange={handleSellTokenChange}
            >
              {ETH_TOKENS.map((token) => (
                <option key={token.address} value={token.symbol.toLowerCase()}
                disabled={token.symbol.toLowerCase() === buyToken}>
                  {token.symbol}
                </option>
              ))}
            </select>
          </div>
          <label htmlFor="sell-amount" className="sr-only"></label>
          <input
            id="sell-amount"
            value={sellAmount}
            className={styles.input}
            style={{ border: '1px solid black' }}
            onChange={(e) => {
              setTradeDirection('sell');
              setSellAmount(e.target.value);
            }}
          />
        </section>
        <div className={styles.balanceText} onClick={handleBalanceClick} style={{ cursor: "pointer" }}>
            Balance: {formattedSellTokenBalance}
          </div>
        <button
        type="button"
        className={styles.toggleButton}
        onClick={toggleTokens}
      >
 <img 
    src="/inv.jpg"  // Path relative to the `public` directory
    alt="Toggle Icon" 
    className={styles.toggleIcon} 
  />
      </button>

        <section className={styles.tokenSection}>
          <label htmlFor="buy-token" className="sr-only"></label>
          <img
            alt={buyToken}
            className={styles.tokenImage}
            src={ETH_TOKENS_BY_SYMBOL[buyToken].logoURI}
          />
          <div className="sm:w-full sm:mr-2">
            <select
              name="buy-token-select"
              id="buy-token-select"
              value={buyToken}
              className={styles.select}
              onChange={(e) => handleBuyTokenChange(e)}
            >
              {ETH_TOKENS.map((token) => (
                <option key={token.address} value={token.symbol.toLowerCase()}
                disabled={token.symbol.toLowerCase() === sellToken}>
                  {token.symbol}
                </option>
              ))}
            </select>
          </div>
          <label htmlFor="buy-amount" className="sr-only"></label>
          <input
            id="buy-amount"
            value={parseFloat(buyAmount).toFixed(2)}
            className={`${styles.input} ${styles.inputDisabled}`}
            style={{ border: '1px solid black' }}
            disabled
            onChange={(e) => {
              setTradeDirection('buy');
              setBuyAmount(e.target.value);
            }}
          />
        </section>
        <div className={styles.balanceText}>
            Balance: {formattedBuyTokenBalance}
          </div>

          <div className={styles.affiliateFee}>
  {price && price.grossBuyAmount
    ? `Fee: ${(
        Number(
          formatUnits(
            BigInt(price.grossBuyAmount),
            ETH_TOKENS_BY_SYMBOL[buyToken].decimals
          )
        ) * AFFILIATE_FEE
      ).toFixed(2)} ${ETH_TOKENS_BY_SYMBOL[buyToken].symbol}`
    : null}
</div>

      </div>

      {takerAddress ? (
        <ApproveOrReviewButton
        sellTokenAddress={ETH_TOKENS_BY_SYMBOL[sellToken].address as `0x${string}`}
        takerAddress={takerAddress}
        onClick={() => setFinalize(true)}
        disabled={disabled}
        parsedSellAmount={BigInt(parsedSellAmount || '0')}
        sellRawBalance={sellRawBalance} 
        sellToken={sellToken}
        sellAmount={sellAmount}  // Pass sellAmount here
      />
      ) : (
        <ConnectKitButton.Custom>
          {({ isConnected, show, address }) => (
            <button
              onClick={show}
              type="button"
              className={styles.button}
            >
              {isConnected ? address : 'Connect Wallet'}
            </button>
          )}
        </ConnectKitButton.Custom>
      )}

      {isLoadingPrice && (
        <div className={styles.loading}>Fetching the best price...</div>
      )}
    </form>
  );
}

function ApproveOrReviewButton({
  takerAddress,
  onClick,
  sellTokenAddress,
  disabled,
  parsedSellAmount,
  sellRawBalance,
  sellToken,
  sellAmount,
}: {
  takerAddress: Address;
  onClick: () => void;
  sellTokenAddress: Address;
  disabled?: boolean;
  parsedSellAmount:bigint,
  sellRawBalance: bigint | undefined;
  sellToken: string;
  sellAmount: string; 
}) {
  // 1. Read from erc20, does spender (0x Exchange Proxy) have allowance?
  const { data: allowance, refetch } = useContractRead({
    address: sellTokenAddress,
    abi: erc20ABI,
    functionName: "allowance",
    args: [takerAddress, exchangeProxy],
  });

  
  // 2. (only if no allowance): write to erc20, approve 0x Exchange Proxy to spend max integer
  const allowanceAmount = parsedSellAmount || 0n;
  const { config } = usePrepareContractWrite({
    address: sellTokenAddress,
    abi: erc20ABI,
    functionName: "approve",
    args: [exchangeProxy, allowanceAmount],
  });

  const {
    data: writeContractResult,
    writeAsync: approveAsync,
    error,
  } = useContractWrite(config);

  const { isLoading: isApproving } = useWaitForTransaction({
    hash: writeContractResult ? writeContractResult.hash : undefined,
    onSuccess(data) {
      refetch();
    },
    onError(error) {
      console.error('Transaction failed or was rejected by the user:', error);
      alert('Transaction was rejected or failed. Please try again.');
    },
  });

 const isApprovalNeeded = 
  sellRawBalance &&
  sellAmount &&
  !isNaN(Number(sellAmount)) &&
  parseUnits(sellAmount, ETH_TOKENS_BY_SYMBOL[sellToken].decimals) <= BigInt(sellRawBalance) &&
  (allowance === undefined || allowance === 0n || BigInt(allowance) < parsedSellAmount);


  if (isApprovalNeeded && approveAsync) {
    return (
      <>
        <button
          type="button"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
          onClick={async () => {
            try {
              const writtenValue = await approveAsync();
              console.log('Transaction sent:', writtenValue);
            } catch (error: any) {
              if (error.name === 'TransactionExecutionError' && error.message.includes('User rejected the request')) {
                // Handle the specific case where the user rejects the transaction
                console.warn('User rejected the transaction.');
                alert('You rejected the transaction. Please try again if you wish to proceed.');
                window.location.reload();
              } else {
                // Handle other errors
                console.error('Transaction failed:', error);
                alert('Transaction failed. Please try again.');
                window.location.reload();

              }
            }
          }}
        >
          {isApproving ? "Approving…" : "Approve"}
        </button>
      </>
    );
  }
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={styles.button}
    >
      {disabled ? "Insufficient Balance" : "Review Trade"}
    </button>
  );
}
