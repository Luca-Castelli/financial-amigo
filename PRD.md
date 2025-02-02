# FinancialAmigo - Product Requirements Document

## Overview

FinancialAmigo is a modern investment portfolio tracking application designed to help users monitor their investments across multiple accounts and currencies. The application provides real-time portfolio updates, performance analytics, and relevant financial news.

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

- Add/edit/delete investment transactions
- Support for:
  - Buy orders
  - Sell orders
  - Dividend payments
  - Cash contributions
  - Cash withdrawals
  - Interest earned
  - Account fees
- Transaction history view
- Transaction categorization

### 3. Account Management

- Multiple investment account support
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

- Google OAuth integration with secure token management:
  - Backend handles Google OAuth flow and token verification
  - Frontend redirects to backend's `/api/auth/google` endpoint to initiate OAuth
  - Backend validates Google tokens with 2-second clock skew tolerance
  - Backend generates JWT access and refresh tokens
  - Frontend stores tokens in session storage with basic encryption
  - Automatic token refresh handling via interceptors
  - Protected routes redirect to login if not authenticated

#### Authentication Flow

1. User clicks "Continue with Google"
2. Frontend redirects to backend's `/api/auth/google` endpoint
3. Backend initiates Google OAuth flow
4. User authenticates with Google
5. Google redirects back to backend with auth code
6. Backend:
   - Verifies Google token
   - Creates/updates user in database
   - Generates JWT access and refresh tokens
   - Redirects to frontend with tokens in URL fragment
7. Frontend:
   - Extracts tokens from URL fragment
   - Stores tokens in encrypted session storage
   - Redirects to dashboard

#### Token Management

- Access tokens expire after 15 minutes
- Refresh tokens expire after 7 days
- Tokens stored in encrypted session storage
- Automatic token refresh via axios interceptors
- Token verification on each protected API request

#### Error Handling

- Clock synchronization error detection and user feedback
- Invalid/expired token handling
- Network error handling
- Clear error messages for users
- Automatic logout on auth failures

#### Security Measures

- CORS configuration with specific origin
- HTTP-only cookies in production
- HTTPS enforcement in production
- Secure headers (HSTS, XSS Protection, etc.)
- Rate limiting on auth endpoints
- Input validation and sanitization

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

### Phase 1: Core Infrastructure & Authentication

1. ✓ Set up Next.js frontend project with TypeScript and Tailwind
2. ✓ Initialize FastAPI backend with PostgreSQL
3. ✓ Implement backend-handled Google OAuth with secure cookie management
4. ✓ Create initial database schema and migrations

### Phase 2: Account Management

1. Create account management UI (list, add, edit, delete)
2. Implement backend APIs for account operations
3. Add cash balance tracking and basic validation
4. Set up account settings (currency, broker details)

### Phase 3: Transaction Management

1. Create transaction entry forms (trades, cash movements)
2. Implement transaction history view
3. Add validation rules for transactions
4. Set up Yahoo Finance integration for security lookup
5. Implement FX rates for cross-currency transactions

### Phase 4: Holdings & Portfolio

1. Create holdings view per account
2. Implement portfolio dashboard with allocations
3. Add market data integration for real-time prices
4. Calculate returns and performance metrics
5. Set up historical price tracking

### Phase 5: Analysis & Polish

1. Implement benchmark tracking and comparison
2. Add portfolio analytics and charts
3. Create custom reports and exports
4. Performance optimization and caching
5. Final UI/UX improvements

### Future Enhancements (Post-MVP)

- Support for banking accounts and credit cards
- Real estate and other asset tracking
- Liability management
- Advanced analytics and forecasting
- Mobile app development
- Email notifications for key events
- Document storage for statements
- Tax reporting features

## Database Schema

### Users

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR NOT NULL UNIQUE,
    name VARCHAR NOT NULL,
    image VARCHAR,
    provider VARCHAR NOT NULL DEFAULT 'google',
    google_id VARCHAR NOT NULL UNIQUE,
    default_currency VARCHAR(3) NOT NULL DEFAULT 'CAD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Accounts

```sql
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    name VARCHAR NOT NULL,
    description VARCHAR,
    type VARCHAR NOT NULL CHECK (type IN ('TFSA', 'RRSP', 'FHSA', 'NON_REGISTERED')),
    currency VARCHAR(3) NOT NULL DEFAULT 'CAD',
    broker VARCHAR,
    account_number VARCHAR,
    cash_balance DECIMAL(20,6) NOT NULL DEFAULT 0,
    cash_interest_ytd DECIMAL(20,6) NOT NULL DEFAULT 0,
    cash_last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

-- Securities metadata
CREATE TABLE securities (
symbol VARCHAR PRIMARY KEY,
name VARCHAR NOT NULL,
asset_type VARCHAR NOT NULL, -- EQUITY, FIXED_INCOME, CASH
asset_subtype VARCHAR, -- For equities: LARGE_CAP, MID_CAP, etc.
sector VARCHAR, -- Technology, Healthcare, etc.
industry VARCHAR,
exchange VARCHAR NOT NULL,
currency VARCHAR(3) NOT NULL, -- Trading currency
last_price DECIMAL(20,6),
last_price_updated TIMESTAMP WITH TIME ZONE,
market_cap DECIMAL(20,2),
is_active BOOLEAN DEFAULT true,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Holdings
CREATE TABLE holdings (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
account_id UUID REFERENCES accounts(id),
symbol VARCHAR REFERENCES securities(symbol),
quantity DECIMAL(20,6) NOT NULL,
avg_cost_native DECIMAL(20,6) NOT NULL, -- In security's currency
market_value_native DECIMAL(20,6), -- In security's currency
unrealized_pl_native DECIMAL(20,6), -- In security's currency
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
UNIQUE (account_id, symbol)
);

-- Investment Transactions
CREATE TABLE transactions (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
account_id UUID REFERENCES accounts(id),
symbol VARCHAR REFERENCES securities(symbol),
type VARCHAR NOT NULL, -- BUY, SELL, DIVIDEND
trade_date TIMESTAMP WITH TIME ZONE NOT NULL,
settlement_date TIMESTAMP WITH TIME ZONE,
quantity DECIMAL(20,6), -- Null for cash transactions, negative for sells
price_native DECIMAL(20,6), -- In security's currency
total_native DECIMAL(20,6), -- In security's currency
total_account DECIMAL(20,6), -- In account's currency
fx_rate DECIMAL(20,6) NOT NULL, -- Rate between security and account currency
fees_native DECIMAL(20,6) DEFAULT 0,
status VARCHAR NOT NULL DEFAULT 'PENDING', -- PENDING, SETTLED, CANCELLED
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cash Transactions
CREATE TABLE cash_transactions (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
account_id UUID REFERENCES accounts(id),
type VARCHAR NOT NULL, -- CONTRIBUTION, WITHDRAWAL, INTEREST, FEE, DIVIDEND, TRADE
date TIMESTAMP WITH TIME ZONE NOT NULL,
amount DECIMAL(20,6) NOT NULL, -- Positive for inflow, negative for outflow
description VARCHAR,
security_id UUID REFERENCES securities(id), -- For dividends
related_transaction_id UUID REFERENCES transactions(id), -- For trades
related_cash_transaction_id UUID REFERENCES cash_transactions(id), -- For transfers
source_currency VARCHAR(3), -- For transfers/FX
target_currency VARCHAR(3), -- For transfers/FX
fx_rate DECIMAL(20,6), -- For transfers/FX
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Historical Prices
CREATE TABLE historical_prices (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
symbol VARCHAR NOT NULL REFERENCES securities(symbol),
date DATE NOT NULL,
open DECIMAL(20,6) NOT NULL,
high DECIMAL(20,6) NOT NULL,
low DECIMAL(20,6) NOT NULL,
close DECIMAL(20,6) NOT NULL,
volume BIGINT NOT NULL,
adjusted_close DECIMAL(20,6) NOT NULL,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
UNIQUE (symbol, date)
);

-- Historical FX Rates
CREATE TABLE historical_fx_rates (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
from_currency VARCHAR(3) NOT NULL,
to_currency VARCHAR(3) NOT NULL,
date DATE NOT NULL,
rate DECIMAL(20,6) NOT NULL,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
UNIQUE (from_currency, to_currency, date)
);

-- Benchmarks
CREATE TABLE benchmarks (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
symbol VARCHAR NOT NULL,
name VARCHAR NOT NULL,
currency VARCHAR(3) NOT NULL,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Benchmark Values
CREATE TABLE benchmark_values (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
benchmark_id UUID REFERENCES benchmarks(id),
date DATE NOT NULL,
value DECIMAL(20,6) NOT NULL,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
UNIQUE (benchmark_id, date)
);

-- Portfolio Benchmarks
CREATE TABLE portfolio_benchmarks (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id UUID REFERENCES users(id),
benchmark_id UUID REFERENCES benchmarks(id),
weight DECIMAL(5,2) NOT NULL,
start_date DATE NOT NULL,
end_date DATE,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

## Future Enhancements (Post-MVP)

1. Additional Account Types:

   - Banking accounts (checking, savings)
   - Credit cards
   - Real estate properties
   - Other liabilities (mortgages, loans)

2. Enhanced Features for New Account Types:

   - Bill payment tracking
   - Credit card rewards
   - Property value tracking
   - Mortgage amortization
   - Net worth calculation including all assets/liabilities

3. Email notifications for:

   - Price alerts
   - Dividend payments
   - Account activities

4. Advanced Analytics:

   - Tax loss harvesting
   - Portfolio rebalancing
   - Risk analysis
   - Correlation analysis

5. Additional Features:
   - Mobile app
   - Export functionality
   - Custom watchlists
   - More broker integrations
   - Additional data providers
   - Social sharing
   - Market news
