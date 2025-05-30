const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Load OpenAI API key from environment
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Helper function to format currency
const formatCurrency = (amount) => {
	return new Intl.NumberFormat('en-US', {
		style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0,
	}).format(amount);
};

// Calculate mortgage details
const calculateMortgageDetails = (principal, annualRate, termYears, additionalPayment = 0, startDate = new Date()) => {
	const monthlyRate = annualRate / 100 / 12;
	const numberOfPayments = termYears * 12;

	// Calculate original monthly payment (P&I)
	const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
						   (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

	// Generate original amortization schedule
	const originalSchedule = generateAmortizationSchedule(principal, monthlyRate, numberOfPayments, monthlyPayment, startDate);

	// Generate schedule with additional payments
	const acceleratedSchedule = generateAmortizationSchedule(principal, monthlyRate, numberOfPayments, monthlyPayment + additionalPayment,
		startDate, true);

	// Calculate savings
	const originalTotalInterest = originalSchedule.reduce((sum, payment) => sum + payment.interest, 0);
	const acceleratedTotalInterest = acceleratedSchedule.reduce((sum, payment) => sum + payment.interest, 0);
	const interestSaved = originalTotalInterest - acceleratedTotalInterest;

	// Calculate time saved
	const originalPayoffDate = originalSchedule[originalSchedule.length - 1].date;
	const acceleratedPayoffDate = acceleratedSchedule[acceleratedSchedule.length - 1].date;
	const monthsSaved = (originalPayoffDate.getFullYear() - acceleratedPayoffDate.getFullYear()) * 12 +
						(originalPayoffDate.getMonth() - acceleratedPayoffDate.getMonth());

	return {
		originalSchedule,
		acceleratedSchedule,
		monthlyPayment,
		originalTotalInterest,
		acceleratedTotalInterest,
		interestSaved,
		monthsSaved,
		originalPayoffDate,
		acceleratedPayoffDate,
	};
};

const generateAmortizationSchedule = (principal, monthlyRate, maxPayments, monthlyPayment, startDate, allowEarlyPayoff = false) => {
	const schedule = [];
	let remainingBalance = principal;
	let currentDate = new Date(startDate);
	let paymentNumber = 0;

	while (remainingBalance > 0.01 && (!allowEarlyPayoff || paymentNumber < maxPayments)) {
		const interestPayment = remainingBalance * monthlyRate;
		let principalPayment = monthlyPayment - interestPayment;

		if (principalPayment > remainingBalance) {
			principalPayment = remainingBalance;
		}

		remainingBalance -= principalPayment;
		paymentNumber++;

		schedule.push({
			paymentNumber,
			date: new Date(currentDate),
			payment: principalPayment + interestPayment,
			principal: principalPayment,
			interest: interestPayment,
			balance: Math.max(0, remainingBalance),
		});

		currentDate.setMonth(currentDate.getMonth() + 1);

		if (remainingBalance <= 0.01) break;
	}

	return schedule;
};

// Enhanced calculations function
const enhanceWithCalculations = (aiResponse, userQuery, mortgageData) => {
	if (!mortgageData) return aiResponse;

	// Extract dollar amounts from user query
	const dollarMatch = userQuery.toLowerCase().match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
	const amount = dollarMatch ? parseFloat(dollarMatch[1].replace(/,/g, '')) : null;

	if (amount && (userQuery.toLowerCase().includes('add') || userQuery.toLowerCase().includes('extra'))) {
		try {
			const result = calculateMortgageDetails(mortgageData.principal, mortgageData.rate, mortgageData.term, amount,
				new Date(mortgageData.startDate));

			const yearsSaved = Math.floor(result.monthsSaved / 12);
			const monthsSaved = result.monthsSaved % 12;

			let timeString = '';
			if (yearsSaved > 0) {
				timeString += `${yearsSaved} year${yearsSaved > 1 ? 's' : ''}`;
				if (monthsSaved > 0) {
					timeString += ` and ${monthsSaved} month${monthsSaved > 1 ? 's' : ''}`;
				}
			} else {
				timeString = `${monthsSaved} month${monthsSaved > 1 ? 's' : ''}`;
			}

			// Append specific calculations to AI response
			aiResponse += `\n\n💰 Specific calculation: Adding ${formatCurrency(
				amount)} per month would save you ${timeString} and ${formatCurrency(result.interestSaved)} in total interest.`;
		} catch (error) {
			console.error('Calculation error:', error);
		}
	}

	return aiResponse;
};

// API endpoint for OpenAI chat
app.post('/api/chat', async (req, res) => {
	try {
		const {userQuery, mortgageData} = req.body;

		// Log user request
		console.log('=== USER REQUEST ===');
		console.log('Query:', userQuery);
		if (mortgageData) {
			console.log('Mortgage Data:', {
				principal: mortgageData.principal,
				rate: mortgageData.rate,
				term: mortgageData.term,
				additionalPayment: mortgageData.additionalPayment,
				startDate: mortgageData.startDate,
			});
		} else {
			console.log('Mortgage Data: None provided');
		}

		if (!OPENAI_API_KEY) {
			console.error('OpenAI API key not configured. Please check your environment variables.');
			return res.status(500).json({
				error: 'OpenAI API key not configured', message: 'OpenAI is not available. Please try again later.',
			});
		}

		if (!userQuery) {
			return res.status(400).json({
				error: 'Missing user query', message: 'Please provide a question.',
			});
		}

		// Prepare context about the user's mortgage
		const mortgageContext = mortgageData ? `
Current mortgage details:
- Loan amount: ${formatCurrency(mortgageData.principal)}
- Interest rate: ${mortgageData.rate}%
- Loan term: ${mortgageData.term} years
- Current additional payment: ${formatCurrency(mortgageData.additionalPayment)}
- Start date: ${new Date(mortgageData.startDate).toLocaleDateString()}
` : 'No mortgage data provided yet.';

		// Create the system prompt
		const systemPrompt = `You are a helpful mortgage calculator assistant. You help users understand how additional payments affect their mortgage payoff timeline and interest savings.

${mortgageContext}

Your responses should:
1. Be conversational and friendly
2. Include specific calculations when relevant
3. Focus on practical mortgage advice
4. Keep responses under 200 words
5. Always format currency amounts clearly

If the user asks about scenarios with different payment amounts or timeframes, provide specific calculations using the mortgage data provided.`;

		const requestBody = {
			model: 'gpt-3.5-turbo', messages: [
				{
					role: 'system', content: systemPrompt,
				}, {
					role: 'user', content: userQuery,
				}], max_tokens: 300, temperature: 0.7,
		};

		// Log API request details
		console.log('=== OPENAI API REQUEST ===');
		console.log('Model:', requestBody.model);
		console.log('Max tokens:', requestBody.max_tokens);
		console.log('Temperature:', requestBody.temperature);
		console.log('System prompt length:', systemPrompt.length);
		console.log('User query length:', userQuery.length);
		console.log('========================');

		const response = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST', headers: {
				'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}`,
			}, body: JSON.stringify(requestBody),
		});

		if (!response.ok) {
			throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
		}

		const data = await response.json();

		if (data.choices && data.choices.length > 0) {
			let aiResponse = data.choices[0].message.content.trim();

			// Log raw OpenAI response
			console.log('=== OPENAI RAW RESPONSE ===');
			console.log('Response:', aiResponse);
			console.log('Tokens used:', data.usage?.total_tokens || 'Unknown');
			console.log('Model:', data.model || 'Unknown');
			console.log('========================');

			// Enhance the response with actual calculations if numbers are mentioned
			aiResponse = enhanceWithCalculations(aiResponse, userQuery, mortgageData);

			// Log final enhanced response
			console.log('=== FINAL RESPONSE ===');
			console.log('Enhanced Response:', aiResponse);
			console.log('Response Length:', aiResponse.length);
			console.log('===================');

			res.json({
				response: aiResponse, tokens: data.usage?.total_tokens || 0, model: data.model || 'gpt-3.5-turbo',
			});
		} else {
			console.log('=== OPENAI ERROR ===');
			console.log('No choices returned from OpenAI API');
			console.log('Full response:', data);
			console.log('==================');

			res.status(500).json({
				error: 'No response from OpenAI', message: 'I\'m sorry, I couldn\'t generate a response. Please try rephrasing your question.',
			});
		}
	} catch (error) {
		console.log('=== OPENAI API FAILED ===');
		console.error('OpenAI API Error:', error);
		console.log('========================');

		res.status(500).json({
			error: 'OpenAI API failed',
			message: 'Sorry, I encountered an error processing your request. Please try again.',
			details: error.message,
		});
	}
});

// Health check endpoint
app.get('/api/health', (req, res) => {
	res.json({
		status: 'ok', timestamp: new Date().toISOString(), openaiConfigured: !!OPENAI_API_KEY,
	});
});

// Start server
app.listen(PORT, () => {
	console.log(`🚀 Mortgage Calculator API Server running on port ${PORT}`);
	console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
	console.log(`🤖 Chat endpoint: http://localhost:${PORT}/api/chat`);
	console.log(`🔑 OpenAI configured: ${!!OPENAI_API_KEY}`);
});

module.exports = app;