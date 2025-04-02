import type { Address } from "wagmi";

export const MAX_ALLOWANCE =
  115792089237316195423570985008687907853269984665640564039457584007913129639935n;

export const exchangeProxy = "0xdef1c0ded9bec7f1a1670819833240f027b25eff";

interface Token {
  name: string;
  address: Address;
  symbol: string;
  decimals: number;
  chainId: number;
  logoURI: string;
  isNative?: boolean;
}

export const ETH_TOKENS = [
  {
    name: "eth",
    symbol: "eth",
    chainId: 1,
    address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    decimals: 18,
    logoURI: "https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=040",
    isNative: true,
  },
  {
    name: "weth",
    symbol: "weth",
    chainId: 1,
    address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    decimals: 18,
    logoURI: "https://cryptologos.cc/logos/weth-logo.svg?v=040",
    isNative: false,
  },
  {
    name: "usdc",
    symbol: "usdc",
    chainId: 1,
    address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    decimals: 6,
    logoURI: "https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=040",
    isNative: false,
  },
  {
    name: "usdt",
    symbol: "usdt",
    chainId: 1,
    address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    decimals: 6,
    logoURI: "https://cryptologos.cc/logos/tether-usdt-logo.svg?v=040",
    isNative: false,
  },
  {
    name: "uni",
    symbol: "uni",
    chainId: 1,
    address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
    decimals: 18,
    logoURI: "https://cryptologos.cc/logos/uniswap-uni-logo.svg?v=040",
    isNative: false,
  },
  {
    name: "shib",
    symbol: "shib",
    chainId: 1,
    address: "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce",
    decimals: 18,
    logoURI: "https://cryptologos.cc/logos/shiba-inu-shib-logo.svg?v=040",
    isNative: false,
  },
  {
    name: "floki",
    symbol: "floki",
    chainId: 1,
    address: "0xcf0c122c6b73ff809c693db761e7baebe62b6a2e",
    decimals: 18,
    logoURI: "https://cryptologos.cc/logos/floki-inu-floki-logo.svg?v=040",
    isNative: false,
  },
  {
    name: "pepe",
    symbol: "pepe",
    chainId: 1,
    address: "0x6982508145454ce325ddbe47a25d4ec3d2311933",
    decimals: 18,
    logoURI: "https://cryptologos.cc/logos/pepe-pepe-logo.svg?v=040",
    isNative: false,
  }
];

// Access by symbol (e.g., eth -> token info)
export const ETH_TOKENS_BY_SYMBOL = Object.fromEntries(
  ETH_TOKENS.map((token) => [token.symbol.toLowerCase(), token])
);

// Access by address (e.g., 0x... -> token info)
export const ETH_TOKENS_BY_ADDRESS = Object.fromEntries(
  ETH_TOKENS.map((token) => [token.address.toLowerCase(), token])
);
