import type { Address } from "wagmi";

export const MAX_ALLOWANCE =
  115792089237316195423570985008687907853269984665640564039457584007913129639935n;

export const exchangeProxy = "0xDef1C0ded9bec7F1a1670819833240f027b25EfF";

/* type Token = {
  address: Address;
}; */

interface Token {
  name: string;
  address: Address;
  symbol: string;
  decimals: number;
  chainId: number;
  logoURI: string;
}
export const BSC_TOKENS = [
  {
    name: "wbnb",
    symbol: "wbnb",
    chainId: 56,
    address: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c", // wrapped Native token placeholder
    decimals: 18,
    logoURI: "https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=040",
    isNative: false
  },
  {
    name: "bnb",
    symbol: "bnb",
    chainId: 56,
    address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    decimals: 18,
    logoURI: "https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=040",
    isNative: true
  },
  {
    name: "usdc",
    symbol: "usdc",
    chainId: 56,
    address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", // USDC on BSC
    decimals: 18,
    logoURI: "https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=040",
    isNative: false
  },
  {
    name: "usdt",
    symbol: "usdt",
    chainId: 56,
    address: "0x55d398326f99059ff775485246999027b3197955", // USDT on BSC
    decimals: 18,
    logoURI: "https://cryptologos.cc/logos/tether-usdt-logo.svg?v=040",
    isNative: false
  },
  {
    name: "eth",
    symbol: "eth",
    chainId: 56,
    address: "0x2170ed0880ac9a755fd29b2688956bd959f933f8", // ETH (BEP-20) on BSC
    decimals: 18,
    logoURI: "https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=040",
    isNative: false
  },
  {
    name: "uni",
    symbol: "uni",
    chainId: 56,
    address: "0xbf5140a22578168fd562dccf235e5d43a02ce9b1", // UNI on BSC
    decimals: 18,
    logoURI: "https://cryptologos.cc/logos/uniswap-uni-logo.svg?v=040",
    isNative: false
  },
  {
    name: "cake",
    symbol: "cake",
    chainId: 56,
    address: "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82", // CAKE (PancakeSwap)
    decimals: 18,
    logoURI: "https://cryptologos.cc/logos/pancakeswap-cake-logo.svg?v=040",
    isNative: false
  },
  {
    name: "shib",
    symbol: "shib",
    chainId: 56,
    address: "0x2859e4544c4bb03966803b044a93563bd2d0dd4d", 
    decimals: 18,
    logoURI: "https://cryptologos.cc/logos/shiba-inu-shib-logo.svg?v=040",
    isNative: false
  },
   {
    name: "broccoli",
    symbol: "broccoli",
    chainId: 56,
    address: "0x6d5ad1592ed9d6d1df9b93c793ab759573ed6714", 
    decimals: 18,
    logoURI: "https://cryptologos.cc/logos/dogs-dogs-logo.svg?v=040",
    isNative: false
  }
];

// Access by symbol (e.g., bnb -> token info)
export const BSC_TOKENS_BY_SYMBOL = Object.fromEntries(
  BSC_TOKENS.map((token) => [token.symbol.toLowerCase(), token])
);

// Access by address (e.g., 0x... -> token info)
export const BSC_TOKENS_BY_ADDRESS = Object.fromEntries(
  BSC_TOKENS.map((token) => [token.address.toLowerCase(), token])
);

