import { parseNaturalLanguageQuery } from './mortgageCalculations';

// API server URL - adjust this based on your deployment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const getOpenAIResponse = async (userQuery, mortgageData) => {
	// Log user request (client-side)
	console.log('=== CLIENT REQUEST ===');
	console.log('Query:', userQuery);
	console.log('Timestamp:', new Date().toISOString());
	console.log('API Server:', API_BASE_URL);
	if (mortgageData) {
		console.log('Mortgage Data:', {
			principal: mortgageData.principal,
			rate: mortgageData.rate,
			term: mortgageData.term,
			additionalPayment: mortgageData.additionalPayment,
			startDate: mortgageData.startDate.toISOString()
		});
	} else {
		console.log('Mortgage Data: None provided');
	}
	console.log('=====================');

	try {
		// Prepare request data for our API server
		const requestData = {
			userQuery,
			mortgageData: mortgageData ? {
				principal: mortgageData.principal,
				rate: mortgageData.rate,
				term: mortgageData.term,
				additionalPayment: mortgageData.additionalPayment,
				startDate: mortgageData.startDate.toISOString()
			} : null
		};

		console.log('=== API SERVER REQUEST ===');
		console.log('Sending request to:', `${API_BASE_URL}/api/chat`);
		console.log('Request data:', requestData);
		console.log('========================');

		// Make request to our REST API server
		const response = await fetch(`${API_BASE_URL}/api/chat`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(requestData),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(`API Server error: ${response.status} - ${errorData.message || response.statusText}`);
		}

		const data = await response.json();

		// Log API server response
		console.log('=== API SERVER RESPONSE ===');
		console.log('Response:', data.response);
		console.log('Tokens used:', data.tokens);
		console.log('Model:', data.model);
		console.log('Response length:', data.response?.length || 0);
		console.log('=========================');

		return data.response;

	} catch (error) {
		console.log('=== API SERVER FAILED ===');
		console.error('API Server Error:', error);
		console.log('Falling back to local calculations...');
		console.log('========================');

		// Fallback to local calculations if API server fails
		const fallbackResponse = getLocalFallbackResponse(userQuery, mortgageData);
		
		console.log('=== FALLBACK RESPONSE ===');
		console.log('Local response:', fallbackResponse);
		console.log('========================');
		
		return fallbackResponse;
	}
};

const getLocalFallbackResponse = (userQuery, mortgageData) => {
	// Use local parsing function as fallback
	return parseNaturalLanguageQuery(userQuery, mortgageData);
};