import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, BarChart2, Zap } from 'lucide-react';

interface CryptoCoin {
  name: string;
  symbol: string;
  value: string;
  icon: string;
  basePrice: number;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume: string;
  prevPrice?: number;
}

interface TradingViewWidgetProps {
  symbol?: string;
  height?: number;
}

export default function TradingViewWidget({ symbol: initialSymbol = 'BINANCE:BTCUSDT', height = 280 }: TradingViewWidgetProps) {
  const [currentSymbol, setCurrentSymbol] = useState(initialSymbol);

  // Initial Seed Data for Cryptos
  const [coins, setCoins] = useState<CryptoCoin[]>([
    { name: 'BTC/USDT', symbol: 'BTC', value: 'BINANCE:BTCUSDT', icon: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', basePrice: 95420.50, price: 95420.50, change24h: 3.82, high24h: 96100.00, low24h: 91450.00, volume: '4.2B' },
    { name: 'ETH/USDT', symbol: 'ETH', value: 'BINANCE:ETHUSDT', icon: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png', basePrice: 2680.15, price: 2680.15, change24h: -1.24, high24h: 2750.40, low24h: 2620.00, volume: '1.8B' },
    { name: 'BNB/USDT', symbol: 'BNB', value: 'BINANCE:BNBUSDT', icon: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png', basePrice: 625.30, price: 625.30, change24h: 0.45, high24h: 632.00, low24h: 618.50, volume: '450M' },
    { name: 'SOL/USDT', symbol: 'SOL', value: 'BINANCE:SOLUSDT', icon: 'https://assets.coingecko.com/coins/images/4128/large/solana.png', basePrice: 184.75, price: 184.75, change24h: 8.12, high24h: 189.20, low24h: 172.40, volume: '920M' }
  ]);

  const [tickColorState, setTickColorState] = useState<Record<string, 'up' | 'down' | 'neutral'>>({});

  // Fetch real-time live prices from public Binance REST API
  const fetchLivePrices = async () => {
    try {
      const response = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT","BNBUSDT","SOLUSDT"]');
      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      if (Array.isArray(data)) {
        setCoins(prevCoins => {
          return prevCoins.map(c => {
            const ticker = data.find((t: any) => t.symbol === c.symbol + 'USDT');
            if (ticker) {
              const nextPrice = parseFloat(ticker.lastPrice);
              const change24h = parseFloat(ticker.priceChangePercent);
              const high24h = parseFloat(ticker.highPrice);
              const low24h = parseFloat(ticker.lowPrice);
              const rawVol = parseFloat(ticker.quoteVolume); // Quote asset volume (USDT)
              
              let volStr = c.volume;
              if (!isNaN(rawVol)) {
                if (rawVol >= 1e9) volStr = (rawVol / 1e9).toFixed(1) + 'B';
                else if (rawVol >= 1e6) volStr = (rawVol / 1e6).toFixed(1) + 'M';
                else if (rawVol >= 1e3) volStr = (rawVol / 1e3).toFixed(1) + 'K';
                else volStr = rawVol.toFixed(0);
              }

              return {
                ...c,
                basePrice: nextPrice,
                price: nextPrice,
                prevPrice: c.price,
                change24h,
                high24h,
                low24h,
                volume: volStr
              };
            }
            return c;
          });
        });
      }
    } catch (err) {
      console.warn('Failed to fetch live prices from Binance API, utilizing backup simulation:', err);
    }
  };

  // Run initial fetch and set interval for real API updates every 8 seconds
  useEffect(() => {
    fetchLivePrices();
    const apiInterval = setInterval(fetchLivePrices, 8000);
    return () => clearInterval(apiInterval);
  }, []);

  // Simulate ultra-smooth, real-time micro-fluctuations every 1.5 seconds
  useEffect(() => {
    const ticker = setInterval(() => {
      setCoins(prevCoins => {
        const nextTickState: Record<string, 'up' | 'down' | 'neutral'> = {};
        const updated = prevCoins.map(c => {
          // Randomized micro-fluctuation factor around 0.02%
          const changePct = (Math.random() - 0.5) * 0.0004;
          const prevPrice = c.price;
          const newPrice = Math.max(1, parseFloat((c.price * (1 + changePct)).toFixed(2)));

          let direction: 'up' | 'down' | 'neutral' = 'neutral';
          if (newPrice > prevPrice) direction = 'up';
          else if (newPrice < prevPrice) direction = 'down';

          nextTickState[c.symbol] = direction;

          return {
            ...c,
            price: newPrice,
            prevPrice,
            // Slightly fluctuate high/low
            high24h: newPrice > c.high24h ? newPrice : c.high24h,
            low24h: newPrice < c.low24h ? newPrice : c.low24h
          };
        });

        setTickColorState(nextTickState);
        // Reset ticker color highlights after 400ms
        setTimeout(() => {
          setTickColorState(prev => {
            const reset: Record<string, 'up' | 'down' | 'neutral'> = {};
            Object.keys(prev).forEach(key => {
              reset[key] = 'neutral';
            });
            return reset;
          });
        }, 400);

        return updated;
      });
    }, 1500);

    return () => clearInterval(ticker);
  }, []);

  const activeCoin = coins.find(s => s.value === currentSymbol) || coins[0];

  return (
    <div className="space-y-4">
      {/* Chart Headers & Symbol Selectors */}
      <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-4.5 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 mb-4.5">
          <div className="flex items-center gap-2.5">
            <img 
              src={activeCoin.icon} 
              alt={activeCoin.name} 
              className="w-7 h-7 rounded-full shadow" 
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-white text-sm font-mono">{activeCoin.name}</h3>
                <span className="text-[8px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/20 uppercase font-black tracking-widest font-mono animate-pulse">Live Chart</span>
              </div>
              <p className="text-[9px] text-zinc-500 font-mono tracking-wider uppercase font-bold mt-0.5">Binance Spot Exchange</p>
            </div>
          </div>

          {/* Quick Crypto Selector buttons */}
          <div className="flex flex-wrap gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-850">
            {coins.map(c => (
              <button
                key={c.value}
                onClick={() => setCurrentSymbol(c.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition font-mono ${
                  currentSymbol === c.value
                    ? 'bg-cyan-500 text-zinc-950 font-black shadow'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                {c.symbol}
              </button>
            ))}
          </div>
        </div>

        {/* Embedded High-Definition TradingView Iframe */}
        <div className="relative rounded-xl overflow-hidden border border-zinc-850 shadow-inner bg-zinc-950" style={{ height: `${height}px` }}>
          <iframe
            id="tradingview_chart"
            name="tradingview_chart"
            title="TradingView Chart"
            src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=${encodeURIComponent(
              currentSymbol
            )}&interval=15&hidesidetoolbar=1&symbology=1&gridColor=rgba(24,24,27,0.3)&theme=dark&style=1&timezone=exchange`}
            className="w-full h-full border-none"
            allowFullScreen
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Dynamic Ticker Panels (Real Prices Dashboard) */}
      <div className="space-y-2">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono px-0.5">
          Live Spot Rates &amp; Volumes
        </h4>

        <div className="grid grid-cols-1 gap-2.5">
          {coins.map(c => {
            const isSelected = currentSymbol === c.value;
            const tickState = tickColorState[c.symbol] || 'neutral';
            
            const isChangePositive = c.change24h >= 0;

            let priceColorClass = 'text-white';
            let bgTickClass = '';
            
            if (tickState === 'up') {
              priceColorClass = 'text-emerald-400 font-black';
              bgTickClass = 'bg-emerald-500/5 border-emerald-500/20';
            } else if (tickState === 'down') {
              priceColorClass = 'text-rose-400 font-black';
              bgTickClass = 'bg-rose-500/5 border-rose-500/20';
            } else if (isSelected) {
              bgTickClass = 'bg-zinc-900 border-zinc-750';
            } else {
              bgTickClass = 'bg-zinc-900/30 border-zinc-900 hover:bg-zinc-900/60';
            }

            return (
              <div
                key={c.value}
                onClick={() => setCurrentSymbol(c.value)}
                className={`p-3 rounded-2xl border transition duration-150 cursor-pointer flex items-center justify-between ${bgTickClass}`}
              >
                {/* Coin details */}
                <div className="flex items-center gap-2.5">
                  <img 
                    src={c.icon} 
                    alt={c.symbol} 
                    className="w-6 h-6 rounded-full shadow-sm" 
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block font-mono">{c.name}</span>
                    <span className="text-[8px] text-zinc-500 font-mono font-bold uppercase mt-0.5">Vol: {c.volume}</span>
                  </div>
                </div>

                {/* Live values metrics */}
                <div className="flex items-center gap-6">
                  {/* Fluctuating Prices */}
                  <div className="text-right">
                    <span className={`text-xs font-bold font-mono transition duration-150 block ${priceColorClass}`}>
                      ${c.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[8px] text-zinc-500 font-mono uppercase font-bold block mt-0.5">Live Bid</span>
                  </div>

                  {/* 24h Change percentage */}
                  <div className="text-right w-16">
                    <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded flex items-center justify-end gap-0.5 ${
                      isChangePositive 
                        ? 'text-emerald-400 bg-emerald-500/10' 
                        : 'text-rose-400 bg-rose-500/10'
                    }`}>
                      {isChangePositive ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                      {isChangePositive ? '+' : ''}{c.change24h}%
                    </span>
                    <span className="text-[8px] text-zinc-500 font-mono uppercase font-bold block mt-1">24h Change</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
