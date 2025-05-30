import {parseNaturalLanguageQuery} from './mortgageCalculations';

// API server URL - adjust this based on your deployment
const API_BASE_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production'
	? 'https://your-app-name.vercel.app'
	: 'http://localhost:3001');

export const getOpenAIResponse = async (userQuery, mortgageData) => {
	try {
		// Prepare request data for our API server
		const requestData = {
			userQuery, mortgageData: mortgageData ? {
				principal: mortgageData.principal,
				rate: mortgageData.rate,
				term: mortgageData.term,
				additionalPayment: mortgageData.additionalPayment,
				startDate: mortgageData.startDate.toISOString(),
			} : null,
		};

		// Make request to our REST API server
		const response = await fetch(`${API_BASE_URL}/api/chat`, {
			method: 'POST', headers: {
				'Content-Type': 'application/json',
			}, body: JSON.stringify(requestData),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(`API Server error: ${response.status} - ${errorData.message || response.statusText}`);
		}

		const data = await response.json();

		return data.response;
	} catch (error) {
		console.error('API Server Error:', error);
		// Fallback to local calculations if API server fails
		return getLocalFallbackResponse(userQuery, mortgageData);
	}
};

const getLocalFallbackResponse = (userQuery, mortgageData) => {
	// Use local parsing function as fallback
	return parseNaturalLanguageQuery(userQuery, mortgageData);
};