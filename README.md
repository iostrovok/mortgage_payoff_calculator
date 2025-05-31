# Mortgage Payoff Calculator

A comprehensive React Native web application that helps users understand how additional monthly payments affect their mortgage payoff timeline and total interest costs. Features an AI-powered assistant for natural language mortgage queries.

## Overview

This mortgage calculator provides detailed analysis of how extra principal payments can dramatically reduce loan duration and interest costs. The application combines precise financial calculations with an intuitive user interface and AI-powered conversational assistance.

### Key Features

- **Mortgage Payment Analysis**: Calculate how additional payments affect payoff date and total interest
- **Visual Timeline Comparison**: Interactive charts showing original vs. accelerated payment schedules  
- **AI Assistant**: Natural language queries powered by OpenAI's GPT-3.5-turbo
- **Responsive Design**: Optimized for mobile and desktop browsers
- **Real-time Calculations**: Instant updates as you modify payment scenarios

## Technology Stack

- **Frontend**: React Native with Expo SDK 53, React Native Web
- **Backend**: Express.js serverless functions  
- **AI Integration**: OpenAI GPT-3.5-turbo API
- **Deployment**: Vercel (with automatic CI/CD)
- **Performance**: Memoized calculations, request caching, debounced inputs

## How to Run Locally

### Prerequisites

- Node.js 16+ 
- npm or yarn
- OpenAI API key (for AI assistant)

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd mortgage_payoff_calculator
npm install
```

2. **Configure environment variables:**
Create a `.env` file in the root directory:
```bash
OPENAI_API_KEY=your_openai_api_key_here
REACT_APP_API_URL=http://localhost:3001
```

3. **Start the application:**
```bash
# Start both API server and web client (recommended)
npm run dev

# Or start individually:
npm run server    # API server on port 3001
npm run web      # Web client on port 8081
```

4. **Access the application:**
- Web: http://localhost:8081
- API: http://localhost:3001/api/health

### Available Scripts

```bash
npm start         # Start Expo development server
npm run web       # Start web development server only  
npm run server    # Start API server only
npm run dev       # Start both server and web client
npm run build     # Build for production
npm test          # Run test suite
```

## AI Tool Configuration

### OpenAI Integration

The application uses **OpenAI's GPT-3.5-turbo** model to provide conversational mortgage assistance.

#### Setup Steps:

1. **Get an OpenAI API key:**
   - Visit https://platform.openai.com/api-keys
   - Create a new API key
   - Copy the key (starts with `sk-`)

2. **Configure the API key:**
   ```bash
   # In your .env file
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

3. **For production deployment:**
   - Set the `OPENAI_API_KEY` environment variable in your hosting platform
   - For Vercel: Add in Project Settings → Environment Variables

#### How the AI Assistant Works:

- **Context Awareness**: Uses your specific mortgage data for personalized responses
- **Natural Language Processing**: Understands queries like "How much sooner if I add $300?"
- **Calculation Enhancement**: Combines AI responses with precise mathematical calculations
- **Fallback System**: Gracefully handles API failures with local calculations
- **Cost Optimization**: Caches responses and limits token usage

#### Supported Query Types:

- **Time Savings**: "How much sooner will I pay off with $X extra?"
- **Interest Savings**: "How much interest will I save with additional payments?"
- **Target Payoff**: "How much extra to pay off in X years?"
- **Scenario Comparison**: "What if I pay $X vs $Y extra per month?"

## Project Structure

```
├── components/
│   ├── MortgageForm.js       # Mortgage input form with validation
│   ├── ResultsDisplay.js     # Payment calculation results
│   ├── PayoffChart.js        # Custom timeline visualization  
│   └── AIAssistant.js        # AI chat interface
├── utils/
│   ├── mortgageCalculations.js  # Core amortization logic
│   ├── openaiService.js      # API client with caching
│   └── debounce.js          # Performance optimization utilities
├── api/
│   └── server.js            # Vercel serverless function
├── App.js                   # Main application component
├── vercel.json             # Deployment configuration
└── package.json            # Dependencies and scripts
```

## Assumptions and Limitations

### Financial Assumptions

- **Fixed Interest Rate**: Does not account for variable/adjustable rates
- **No PMI**: Private Mortgage Insurance calculations not included  
- **Principal & Interest Only**: Excludes taxes, insurance, HOA fees
- **Monthly Payments**: Additional payments applied monthly, not annually
- **No Prepayment Penalties**: Assumes lender allows extra principal payments

### Technical Limitations

- **AI Rate Limits**: OpenAI API has usage limits (fallback to local calculations)
- **Precision**: Calculations rounded to nearest cent (standard banking practice)
- **Date Handling**: Assumes 30-day months for simplicity
- **Browser Compatibility**: Requires modern browsers with ES6+ support
- **Internet Required**: AI features need internet connection

### Input Constraints

- **Loan Amount**: more than 0
- **Interest Rate**: more than 0, annual
- **Loan Term**: more than 0
- **Additional Payment**: more than 0, monthly
- **Loan Start Date**: Must be a valid date in the past or today

### Security Considerations

- **OPENAI API Keys**: Server-side only, not exposed to client
- **No Data Storage**: Calculations performed in-memory only
- **HTTPS Required**: Production deployment requires SSL
- **No Financial Advice**: Tool for educational/planning purposes only

## Deployment

### Vercel (Recommended)

1. **Push to GitHub**
2. **Import to Vercel**: Connect your repository  
3. **Configure Environment Variables**:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `NODE_ENV`: `production`
4. **Deploy**: Automatic builds on git push

### Local Testing

```bash
npm run build          # Build production version
npm run sdeverver      # Test API web + endpoints
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make changes and test thoroughly
4. Run tests: `npm test`
5. Submit a pull request


---

**Note**: This application is for educational and planning purposes only. Always consult with qualified financial professionals for mortgage advice.