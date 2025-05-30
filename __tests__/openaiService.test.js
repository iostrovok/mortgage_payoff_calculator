import {getOpenAIResponse} from '../utils/openaiService';

// Mock fetch globally
global.fetch = jest.fn();

// Mock console.log to avoid noise during tests
const originalConsole = console.log;
beforeAll(() => {
	console.log = jest.fn();
});

afterAll(() => {
	console.log = originalConsole;
});

describe('OpenAI Service', () => {
	const mockMortgageData = {
		principal: 300000, rate: 6.5, term: 30, additionalPayment: 0, startDate: new Date('2024-01-01'),
	};

	beforeEach(() => {
		fetch.mockClear();
		console.log.mockClear();
	});

	describe('getOpenAIResponse', () => {
		test('should successfully make API request and return response', async () => {
			const mockResponse = {
				response: 'Adding $300 per month would save you 5 years and $50,000 in interest.', tokens: 150, model: 'gpt-3.5-turbo',
			};

			fetch.mockResolvedValueOnce({
				ok: true, json: async () => mockResponse,
			});

			const userQuery = 'How much sooner if I add $300 per month?';
			const result = await getOpenAIResponse(userQuery, mockMortgageData);

			expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/chat'), expect.objectContaining({
				method: 'POST', headers: {'Content-Type': 'application/json'}, body: expect.stringContaining(userQuery),
			}));

			expect(result).toBe(mockResponse.response);
		});

		test('should handle API server errors gracefully with fallback', async () => {
			fetch.mockResolvedValueOnce({
				ok: false, status: 500, statusText: 'Internal Server Error', json: async () => ({message: 'Server error'}),
			});

			const userQuery = 'How much sooner if I add $300 per month?';
			const result = await getOpenAIResponse(userQuery, mockMortgageData);

			// Should fall back to local calculations
			expect(result).toContain('$300');
			expect(result).toContain('sooner');
			expect(typeof result).toBe('string');
		});

		test('should handle network errors with fallback', async () => {
			fetch.mockRejectedValueOnce(new Error('Network error'));

			const userQuery = 'How much sooner if I add $300 per month?';
			const result = await getOpenAIResponse(userQuery, mockMortgageData);

			// Should fall back to local calculations
			expect(result).toContain('$300');
			expect(result).toContain('sooner');
			expect(typeof result).toBe('string');
		});

		test('should send correct request data format', async () => {
			const mockResponse = {
				response: 'Test response', tokens: 100, model: 'gpt-3.5-turbo',
			};

			fetch.mockResolvedValueOnce({
				ok: true, json: async () => mockResponse,
			});

			const userQuery = 'Test query';
			await getOpenAIResponse(userQuery, mockMortgageData);

			const fetchCall = fetch.mock.calls[0];
			const requestBody = JSON.parse(fetchCall[1].body);

			expect(requestBody).toEqual({
				userQuery: 'Test query', mortgageData: {
					principal: 300000, rate: 6.5, term: 30, additionalPayment: 0, startDate: '2024-01-01T00:00:00.000Z',
				},
			});
		});

		test('should handle null mortgage data', async () => {
			const mockResponse = {
				response: 'Please provide mortgage details', tokens: 50, model: 'gpt-3.5-turbo',
			};

			fetch.mockResolvedValueOnce({
				ok: true, json: async () => mockResponse,
			});

			const userQuery = 'Help with mortgage';
			const result = await getOpenAIResponse(userQuery, null);

			const fetchCall = fetch.mock.calls[0];
			const requestBody = JSON.parse(fetchCall[1].body);

			expect(requestBody.mortgageData).toBeNull();
			expect(result).toBe(mockResponse.response);
		});

		test('should use correct API base URL from environment', async () => {
			const mockResponse = {
				response: 'Test response', tokens: 100, model: 'gpt-3.5-turbo',
			};

			fetch.mockResolvedValueOnce({
				ok: true, json: async () => mockResponse,
			});

			await getOpenAIResponse('test query', mockMortgageData);

			const fetchCall = fetch.mock.calls[0];
			const url = fetchCall[0];

			// Should use default localhost URL since no environment variable is set in tests
			expect(url).toContain('localhost:3001/api/chat');
		});

		test('should handle malformed API responses', async () => {
			fetch.mockResolvedValueOnce({
				ok: true, json: async () => ({response: undefined}),
			});

			const userQuery = 'How much sooner if I add $300 per month?';
			const result = await getOpenAIResponse(userQuery, mockMortgageData);

			// Should return undefined which gets handled as fallback
			expect(result).toBe(undefined);
		});

		test('should handle empty responses gracefully', async () => {
			const mockResponse = {
				response: '', tokens: 0, model: 'gpt-3.5-turbo',
			};

			fetch.mockResolvedValueOnce({
				ok: true, json: async () => mockResponse,
			});

			const userQuery = 'Test query';
			const result = await getOpenAIResponse(userQuery, mockMortgageData);

			expect(result).toBe('');
		});
	});

	describe('Fallback behavior', () => {
		test('should provide meaningful fallback for common queries', async () => {
			fetch.mockRejectedValueOnce(new Error('API unavailable'));

			const testCases = [
				{
					query: 'How much sooner if I add $500 per month?', expectedContains: ['$500', 'sooner'],
				}, {
					query: 'What total interest will I save with $200?', expectedContains: ['$200', 'save'],
				}, {
					query: 'Can I finish my mortgage in 15 years?', expectedContains: ['15 years'],
				}];

			for (const testCase of testCases) {
				const result = await getOpenAIResponse(testCase.query, mockMortgageData);

				testCase.expectedContains.forEach(expectedText => {
					expect(result).toContain(expectedText);
				});
			}
		});

		test('should handle fallback without mortgage data', async () => {
			fetch.mockRejectedValueOnce(new Error('API unavailable'));

			const result = await getOpenAIResponse('Help with mortgage', null);

			expect(result).toContain('I\'d be happy to help');
		});
	});

	describe('Request validation', () => {
		test('should handle special characters in queries', async () => {
			const mockResponse = {response: 'Test response', tokens: 100, model: 'gpt-3.5-turbo'};
			fetch.mockResolvedValueOnce({ok: true, json: async () => mockResponse});

			const specialQuery = 'What if I add $1,500.50 per month? (20% extra)';
			const result = await getOpenAIResponse(specialQuery, mockMortgageData);

			const fetchCall = fetch.mock.calls[0];
			const requestBody = JSON.parse(fetchCall[1].body);

			expect(requestBody.userQuery).toBe(specialQuery);
			expect(result).toBe(mockResponse.response);
		});

		test('should handle very long queries', async () => {
			const mockResponse = {response: 'Test response', tokens: 100, model: 'gpt-3.5-turbo'};
			fetch.mockResolvedValueOnce({ok: true, json: async () => mockResponse});

			const longQuery = 'How much sooner would I pay off my mortgage if I add extra payments? '.repeat(10);
			const result = await getOpenAIResponse(longQuery, mockMortgageData);

			expect(result).toBe(mockResponse.response);
		});
	});
});