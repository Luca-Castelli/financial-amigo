# FinancialAmigo - Product Requirements Document

## Overview

FinancialAmigo is a modern investment portfolio tracking application designed to help users monitor their investments and net worth across multiple accounts and currencies. The application provides real-time portfolio updates, performance analytics, and relevant financial news.

## Target Users

- Individual investors managing multiple investment accounts
- Users with investments across different currencies (CAD/USD)
- Users with registered accounts (TFSA, RRSP, FHSA) and non-registered accounts

## Core Features

### 1. Portfolio Dashboard

- **Overview Tab**

  - Total portfolio value
  - Unrealized profit/loss
  - Total dividends received
  - Portfolio allocation chart
  - Historical performance graph
  - Latest news about holdings

- **Holdings Tab**

  - List of current stock holdings
  - Current market prices (real-time)
  - Average cost basis
  - Quantity held
  - Current value
  - Unrealized P/L

- **Dividends Tab**

  - Dividend payment history
  - Payment dates
  - Amount received
  - Dividend-paying securities

- **Performance Tab**

  - Historical portfolio value chart
  - Monthly/yearly performance metrics
  - Comparison with market benchmarks

- **Analysis Tab**
  - Custom date range analysis
  - Portfolio value changes
  - Investment returns calculation
  - Contribution/withdrawal tracking
  - Percent return metrics

### 2. Transaction Management

- Add/edit/delete transactions
- Support for:
  - Buy orders
  - Sell orders
  - Dividend payments
  - Contributions
  - Withdrawals
- Transaction history view
- Transaction categorization

### 3. Account Management

- Multiple account support
- Account types:
  - TFSA
  - RRSP
  - FHSA
  - Margin
  - Cash
- Multi-currency support (CAD/USD)
- Broker tracking (TD, IBKR, Wealthsimple, etc.)

### 4. Market Data

- Real-time stock prices
- Historical price data
- Company news integration
- Currency exchange rates
- Price alerts (future feature)

## Technical Requirements

### Authentication

- Google OAuth integration
- Email/password authentication
- Session management with NextAuth
- No email verification for MVP

### Data Management

- Real-time price updates (1-minute cache)
- Historical price data storage
- Multi-currency support
- Data validation and sanitization
- Support for multiple asset types and classifications
- Tax-aware transaction tracking

### Performance

- Quick page load times (<2s)
- Responsive UI
- Mobile-friendly design
- Efficient data caching

### Security

- Secure password storage
- Protected API endpoints
- HTTPS encryption
- Rate limiting
- Input validation

## API Integration

1. **Yahoo Finance API**

   - Real-time stock prices
   - Historical price data
   - Basic company information

2. **NewsAPI**

   - Company news
   - Market updates
   - Financial headlines

3. **Exchange Rate API**
   - Currency conversion rates
   - Historical FX data

## Implementation Plan

### Phase 1: Core Infrastructure

1. Set up Next.js frontend project ✅
2. Initialize FastAPI backend
3. Configure NextAuth authentication
4. Set up PostgreSQL database
5. Implement basic API structure

### Phase 2: Data Layer

1. Implement database models
2. Set up Yahoo Finance integration
3. Configure NewsAPI integration
4. Implement caching system
5. Set up FX rate handling

### Phase 3: Core Features

1. User authentication flows
2. Portfolio dashboard
3. Transaction management
4. Account management
5. Basic analysis features

### Phase 4: Advanced Features

1. Performance tracking
2. Dividend tracking
3. Multi-currency support
4. News integration
5. Analysis tools

### Phase 5: Polish

1. UI/UX improvements
2. Performance optimization
3. Error handling
4. Testing
5. Documentation

## Database Schema

```sql
-- Users (managed by NextAuth)
CREATE TABLE users (
    id VARCHAR PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    name VARCHAR,
    default_currency VARCHAR(3) NOT NULL DEFAULT 'CAD'
);

-- Account Categories
CREATE TABLE account_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    type VARCHAR NOT NULL  -- INVESTMENT, BANKING, CREDIT, REAL_ESTATE, LIABILITY
);

-- Accounts
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR REFERENCES users(id),
    category_id INTEGER REFERENCES account_categories(id),
    name VARCHAR NOT NULL,
    type VARCHAR NOT NULL,      -- TFSA, RRSP, FHSA, MARGIN, CASH, CHQ, SAV, etc.
    tax_type VARCHAR NOT NULL,  -- REGISTERED, NON_REGISTERED, NA
    currency VARCHAR(3) NOT NULL,
    broker VARCHAR,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Securities metadata
CREATE TABLE securities (
    symbol VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    asset_type VARCHAR NOT NULL,    -- EQUITY, FIXED_INCOME, CASH, REAL_ESTATE
    asset_subtype VARCHAR,          -- For equities: LARGE_CAP, MID_CAP, etc.
    sector VARCHAR,                 -- Technology, Healthcare, etc.
    exchange VARCHAR NOT NULL,
    currency VARCHAR(3) NOT NULL    -- Trading currency
);

-- Holdings
CREATE TABLE holdings (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES accounts(id),
    symbol VARCHAR REFERENCES securities(symbol),
    quantity DECIMAL NOT NULL,
    avg_cost_native DECIMAL NOT NULL,  -- In security's currency
    UNIQUE (account_id, symbol)
);

-- Transactions
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES accounts(id),
    symbol VARCHAR REFERENCES securities(symbol),
    type VARCHAR NOT NULL,          -- BUY, SELL, DIVIDEND, CONTRIBUTION, WITHDRAWAL
    quantity DECIMAL,
    price_native DECIMAL NOT NULL,  -- In security's currency
    total_native DECIMAL NOT NULL,  -- In security's currency
    total_account DECIMAL NOT NULL, -- In account's currency
    fx_rate DECIMAL NOT NULL,       -- Rate between security and account currency
    fees_native DECIMAL DEFAULT 0,
    date TIMESTAMP NOT NULL
);

-- Benchmarks
CREATE TABLE benchmarks (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    currency VARCHAR(3) NOT NULL
);

-- Portfolio Benchmarks
CREATE TABLE portfolio_benchmarks (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR REFERENCES users(id),
    benchmark_id INTEGER REFERENCES benchmarks(id),
    weight DECIMAL NOT NULL,
    start_date DATE NOT NULL
);

-- Historical Prices (includes both securities and benchmarks)
CREATE TABLE historical_prices (
    symbol VARCHAR NOT NULL,
    date DATE NOT NULL,
    close_price DECIMAL NOT NULL,
    currency VARCHAR(3) NOT NULL,
    PRIMARY KEY (symbol, date)
);

-- FX Rates
CREATE TABLE historical_fx_rates (
    from_currency VARCHAR(3) NOT NULL,
    to_currency VARCHAR(3) NOT NULL,
    date DATE NOT NULL,
    rate DECIMAL NOT NULL,
    PRIMARY KEY (from_currency, to_currency, date)
);

-- Assets (for net worth tracking)
CREATE TABLE assets (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR REFERENCES users(id),
    type VARCHAR NOT NULL,      -- REAL_ESTATE, VEHICLE, etc.
    name VARCHAR NOT NULL,
    currency VARCHAR(3) NOT NULL,
    current_value DECIMAL NOT NULL,
    acquisition_date DATE,
    acquisition_price DECIMAL
);

-- Asset Valuations
CREATE TABLE asset_valuations (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER REFERENCES assets(id),
    date DATE NOT NULL,
    value DECIMAL NOT NULL
);
```

## Non-Functional Requirements

### Performance

- Page load time < 2 seconds
- API response time < 500ms
- Support for up to 10 concurrent users
- Handle portfolios with up to 100 positions

### Reliability

- System uptime > 99%
- Data backup daily
- Graceful error handling
- Automatic recovery from API failures

### Security

- Secure password hashing
- JWT token authentication
- HTTPS encryption
- Input validation and sanitization
- Rate limiting on API endpoints

### Maintainability

- Clean code architecture
- Comprehensive documentation
- Modular design
- Version control
- Code review process

## Future Enhancements

1. Email notifications for:

   - Price alerts
   - Dividend payments
   - Account activities

2. Advanced Analytics:

   - Tax loss harvesting
   - Portfolio rebalancing
   - Risk analysis
   - Correlation analysis

3. Additional Features:

   - Mobile app
   - Export functionality
   - Benchmark comparisons
   - Custom watchlists

4. Integration:
   - More brokers
   - Additional data providers
   - Social sharing
   - Market news
