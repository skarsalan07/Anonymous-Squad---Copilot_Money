import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import '@/styles/TradesChat.css';

interface ChartData {
    date: string;
    price: number;
}

interface CompanyInfo {
    company_name?: string;
    sector?: string;
    market_cap?: string | number;
    industry?: string;
    about_summary?: string;
    currency?: string;
}

interface SimpleChartProps {
    data: ChartData[];
    symbol: string;
    theme: string;
    companyInfo?: CompanyInfo;
}

const SimpleChart: React.FC<SimpleChartProps> = ({ data, symbol, theme, companyInfo }) => {
    const isDark = theme === 'dark';
    const color = isDark ? '#00A67E' : '#00A67E'; // Perplexity Teal
    const gridColor = isDark ? '#333' : '#eee';
    const textColor = isDark ? '#888' : '#666';

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    backgroundColor: isDark ? '#191A1A' : '#fff',
                    border: `1px solid ${isDark ? '#333' : '#eee'}`,
                    padding: '10px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    <p style={{ margin: 0, color: textColor, fontSize: '0.8rem' }}>{label}</p>
                    <p style={{ margin: '4px 0 0', color: color, fontWeight: 600 }}>
                        ${payload[0].value}
                    </p>
                </div>
            );
        }
        return null;
    };

    const formatMarketCap = (num: string | number) => {
        if (!num || num === 'N/A') return '';
        const n = typeof num === 'string' ? parseFloat(num) : num;
        if (isNaN(n)) return num;

        if (n >= 1.0e+12) return (n / 1.0e+12).toFixed(2) + 'T';
        if (n >= 1.0e+9) return (n / 1.0e+9).toFixed(2) + 'B';
        if (n >= 1.0e+6) return (n / 1.0e+6).toFixed(2) + 'M';
        return n;
    };

    const currentPrice = data && data.length > 0 ? data[data.length - 1].price : 0;

    return (
        <div style={{ width: '100%', height: 'auto' }}>
            <div style={{ marginBottom: '20px', padding: '0 4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: isDark ? '#fff' : '#000' }}>
                            {companyInfo?.company_name || symbol}
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <span style={{ fontSize: '0.9rem', color: textColor, fontWeight: 500 }}>{symbol}</span>
                            {companyInfo?.sector && (
                                <>
                                    <span style={{ color: textColor }}>•</span>
                                    <span style={{ fontSize: '0.9rem', color: textColor }}>{companyInfo.sector}</span>
                                </>
                            )}
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.75rem', fontWeight: 600, color: isDark ? '#fff' : '#000' }}>
                            ${currentPrice.toFixed(2)}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: textColor }}>
                            {companyInfo?.currency || 'USD'}
                        </div>
                    </div>
                </div>
                {companyInfo?.market_cap && companyInfo.market_cap !== 'N/A' && (
                    <div style={{ marginTop: '12px', display: 'flex', gap: '16px', fontSize: '0.85rem', color: textColor }}>
                        <div>
                            <span style={{ fontWeight: 600 }}>Mkt Cap: </span>
                            {formatMarketCap(companyInfo.market_cap)}
                        </div>
                        {companyInfo?.industry && (
                            <div>
                                <span style={{ fontWeight: 600 }}>Industry: </span>
                                {companyInfo.industry}
                            </div>
                        )}
                    </div>
                )}

                {/* Company Summary */}
                {companyInfo?.about_summary && (
                    <div style={{ marginTop: '16px', fontSize: '0.9rem', lineHeight: '1.5', color: isDark ? '#ccc' : '#555', borderTop: `1px solid ${gridColor}`, paddingTop: '12px' }}>
                        <div style={{ fontWeight: 600, marginBottom: '4px', color: isDark ? '#fff' : '#000' }}>About</div>
                        {companyInfo.about_summary}
                    </div>
                )}
            </div>

            <div style={{ height: 400, width: '100%' }}>
                <ResponsiveContainer>
                    <AreaChart
                        data={data}
                        margin={{
                            top: 10,
                            right: 0,
                            left: 0,
                            bottom: 0,
                        }}
                    >
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                        <XAxis
                            dataKey="date"
                            hide={true}
                        />
                        <YAxis
                            domain={['auto', 'auto']}
                            orientation="right"
                            tick={{ fill: textColor, fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(val) => `$${val}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="price"
                            stroke={color}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorPrice)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SimpleChart;
