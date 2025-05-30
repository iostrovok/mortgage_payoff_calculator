# Mortgage Payoff Calculator

A mobile-first React Native application built with Expo that helps users calculate how additional monthly principal payments affect their mortgage payoff date and total interest paid.

## Features

### 📊 Mortgage Calculator
- Input loan amount, interest rate, loan term, and additional payments
- Calculate new payoff date and interest savings
- Compare original vs accelerated payment schedules

### 📈 Visual Analytics
- Interactive chart showing loan balance over time
- Side-by-side comparison of payment scenarios
- Clear visualization of time and money saved

### 🤖 AI Assistant
- Natural language mortgage queries
- Ask questions like "How much sooner if I add $300 per month?"
- Intelligent parsing of payment amounts and timeframes
- Conversational responses with personalized calculations

## Technology Stack

- **React Native** with Expo SDK 53
- **Expo Web** for browser compatibility
- **react-native-chart-kit** for data visualization
- **react-native-svg** for chart rendering
- Functional components with React Hooks

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mortgage_payoff_calculator
```

2. Install dependencies:
```bash
npm install
```

## Available Scripts

### Development
```bash
# Start development server (all platforms)
npm start

# Start web development server
npm run web

# Start Android development
npm run android

# Start iOS development  
npm run ios
```

### Building
```bash
# Build for production (all platforms)
npx expo export

# Build web version only
npx expo export:web
```

### Stopping the Server
- Press `Ctrl+C` in the terminal to stop the development server

## Usage

1. **Start the app**: Run `npm start` or `npm run web`
2. **Open in browser**: Navigate to `http://localhost:8081` for web version
3. **Input mortgage details**: Fill out the form with your loan information
4. **View results**: See your payoff calculations and savings
5. **Ask the AI**: Use natural language to explore different scenarios

## Example Queries for AI Assistant

- "How much sooner will I pay off my loan if I add $300 per month?"
- "Can I finish my mortgage in 20 years if I add more principal?"
- "What is the total interest I'll save with $500 extra per month?"
- "How much do I need to add monthly to pay off in 15 years?"

## Project Structure

```
├── components/
│   ├── MortgageForm.js      # Input form component
│   ├── ResultsDisplay.js    # Results and calculations display
│   ├── PayoffChart.js       # Chart visualization component
│   └── AIAssistant.js       # Conversational AI interface
├── utils/
│   └── mortgageCalculations.js  # Core calculation logic
├── App.js                   # Main application component
├── app.json                 # Expo configuration
└── package.json            # Dependencies and scripts
```

## Deployment

### Vercel (Recommended for Web)
1. Build the web version: `npx expo export:web`
2. Deploy the `dist` folder to Vercel
3. Configure Vercel to serve the static files

### Expo Application Services (EAS)
For mobile app deployment:
```bash
npm install -g @expo/cli
npx expo build
```

## Development Notes

- The app is optimized for mobile-first design but works great on desktop
- Chart visualizations are responsive and adapt to screen size
- AI assistant uses local calculations (no external API required)
- All calculations are performed client-side for privacy

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## License

This project is licensed under the MIT License.