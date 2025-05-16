export interface Tag {
  Address: string;
  Nametag: string;
  Website: string;
  "Public Note": string;
  "Chain ID": string;
}

export interface RawTag {
  "Contract Address": string;
  "Project Name": string;
  "Public Name Tag": string;
  "UI/Website Link": string;
  "Public Note": string;
}

export interface RawToken {
  Address: string;        
  Name: string;           
  Symbol: string;         
  Logo: string;           
  Website: string;        

}

export interface Token {
  address: string;
  tokenName: string;
  symbol: string;
  imageUrl: string;
  tokenWebsite: string;
  tokenEmail: string;
  shortDescription: string;
  longDescription: string;
  publicNote: string;
  blog: string;
  github: string;
  reddit: string;
  telegram: string;
  slack: string;
  wechat: string;
  facebook: string;
  linkedin: string;
  xTwitter: string;
  discord: string;
  bitcointalk: string;
  whitepaper: string;
  ticketing: string;
  opensea: string;
  coingeckoTicker: string;
  coinmarketcapTicker: string;
  projectName: string;
  explorer: string;
  chainid: string;
}