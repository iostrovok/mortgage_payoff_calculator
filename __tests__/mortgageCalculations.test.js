import {calculateMortgageDetails, formatCurrency, formatDate, parseNaturalLanguageQuery} from '../utils/mortgageCalculations';

describe('Mortgage Calculations', () => {
	describe('calculateMortgageDetails', () => {
		const testMortgage = {
			principal: 300000, annualRate: 6.5, termYears: 30, startDate: new Date('2024-01-01'),
		};

		test('should calculate basic mortgage details correctly', () => {
			const result = calculateMortgageDetails(testMortgage.principal, testMortgage.annualRate, testMortgage.termYears, 0,
				testMortgage.startDate);

			expect(result.monthlyPayment).toBeCloseTo(1896.20, 2);
			expect(result.originalSchedule).toHaveLength(360); // 30 years * 12 months
			expect(result.originalTotalInterest).toBeGreaterThan(0);
			expect(result.originalPayoffDate).toBeInstanceOf(Date);
		});

		test('should calculate additional payment benefits correctly', () => {
			const additionalPayment = 200;
			const result = calculateMortgageDetails(testMortgage.principal, testMortgage.annualRate, testMortgage.termYears,
				additionalPayment, testMortgage.startDate);

			expect(result.acceleratedSchedule.length).toBeLessThan(result.originalSchedule.length);
			expect(result.interestSaved).toBeGreaterThan(0);
			expect(result.monthsSaved).toBeGreaterThan(0);
			expect(result.acceleratedTotalInterest).toBeLessThan(result.originalTotalInterest);
		});

		test('should handle zero additional payment', () => {
			const result = calculateMortgageDetails(testMortgage.principal, testMortgage.annualRate, testMortgage.termYears, 0,
				testMortgage.startDate);

			expect(result.interestSaved).toBe(0);
			expect(result.monthsSaved).toBe(0);
			expect(result.originalSchedule.length).toBe(result.acceleratedSchedule.length);
		});

		test('should handle edge cases with small principal amounts', () => {
			const result = calculateMortgageDetails(1000, 5.0, 5, 0, testMortgage.startDate);

			expect(result.monthlyPayment).toBeGreaterThan(0);
			expect(result.originalSchedule).toHaveLength(60); // 5 years * 12 months
			expect(result.originalTotalInterest).toBeGreaterThan(0);
		});

		test('should handle high additional payments that pay off loan early', () => {
			const result = calculateMortgageDetails(testMortgage.principal, testMortgage.annualRate, testMortgage.termYears, 2000, // Large additional payment
				testMortgage.startDate);

			expect(result.acceleratedSchedule.length).toBeLessThan(180); // Less than 15 years
			expect(result.monthsSaved).toBeGreaterThan(120); // More than 10 years saved
		});
	});

	describe('formatCurrency', () => {
		test('should format currency without decimals for whole numbers', () => {
			expect(formatCurrency(1000)).toBe('$1,000');
			expect(formatCurrency(1500.99)).toBe('$1,501');
			expect(formatCurrency(0)).toBe('$0');
		});

		test('should handle large numbers with proper formatting', () => {
			expect(formatCurrency(1000000)).toBe('$1,000,000');
			expect(formatCurrency(350000)).toBe('$350,000');
		});

		test('should handle negative numbers', () => {
			expect(formatCurrency(-1000)).toBe('-$1,000');
		});
	});

	describe('formatDate', () => {
		test('should format dates in US format', () => {
			const date = new Date(2024, 11, 25); // Month is 0-indexed
			expect(formatDate(date)).toBe('December 25, 2024');
		});

		test('should handle different months correctly', () => {
			const date = new Date(2024, 0, 1); // January 1, 2024
			expect(formatDate(date)).toBe('January 1, 2024');
		});
	});

	describe('parseNaturalLanguageQuery', () => {
		const mockMortgageData = {
			principal: 300000, rate: 6.5, term: 30, startDate: new Date('2024-01-01'),
		};

		test('should parse "sooner" queries with dollar amounts', () => {
			const query = 'How much sooner if I add $300 per month?';
			const result = parseNaturalLanguageQuery(query, mockMortgageData);

			expect(result).toContain('$300');
			expect(result).toContain('sooner');
			expect(result).toContain('saving');
		});

		test('should parse total interest queries', () => {
			const query = 'How much total interest will I save with $500 per month?';
			const result = parseNaturalLanguageQuery(query, mockMortgageData);

			expect(result).toContain('$500');
			expect(result).toContain('save');
			expect(result).toContain('total interest');
		});

		test('should parse payoff time queries', () => {
			const query = 'Can I finish my mortgage in 20 years?';
			const result = parseNaturalLanguageQuery(query, mockMortgageData);

			expect(result).toContain('20 years');
			expect(result).toContain('add');
		});

		test('should handle queries without mortgage data', () => {
			const query = 'How much sooner if I add $300 per month?';
			const result = parseNaturalLanguageQuery(query, null);

			expect(result).toContain('I\'d be happy to help');
		});

		test('should handle unrecognized query patterns', () => {
			const query = 'What is the meaning of life?';
			const result = parseNaturalLanguageQuery(query, mockMortgageData);

			expect(result).toContain('I\'d be happy to help');
		});

		test('should extract dollar amounts correctly', () => {
			const queries = [
				'add $300 per month', 'add 300 per month', 'add $1,500 per month', 'add $1500.00 per month'];

			queries.forEach(query => {
				const result = parseNaturalLanguageQuery(query + ' sooner?', mockMortgageData);
				expect(result).toContain('sooner');
			});
		});

		test('should extract years correctly', () => {
			const query = 'finish in 15 years';
			const result = parseNaturalLanguageQuery(query, mockMortgageData);

			expect(result).toContain('15 years');
		});
	});

	describe('Amortization Schedule Validation', () => {
		test('should generate consistent amortization schedule', () => {
			const result = calculateMortgageDetails(100000, 5.0, 10, 0, new Date('2024-01-01'));

			// Check that each payment reduces the balance
			for (let i = 1; i < result.originalSchedule.length; i++) {
				expect(result.originalSchedule[i].balance).toBeLessThanOrEqual(result.originalSchedule[i - 1].balance);
			}

			// Check that final balance is near zero
			const finalPayment = result.originalSchedule[result.originalSchedule.length - 1];
			expect(finalPayment.balance).toBeLessThan(1);
		});

		test('should have consistent payment calculations', () => {
			const result = calculateMortgageDetails(200000, 4.5, 15, 100, new Date('2024-01-01'));

			result.originalSchedule.forEach(payment => {
				// Payment should equal principal + interest
				expect(payment.payment).toBeCloseTo(payment.principal + payment.interest, 2);

				// All values should be non-negative
				expect(payment.principal).toBeGreaterThanOrEqual(0);
				expect(payment.interest).toBeGreaterThanOrEqual(0);
				expect(payment.balance).toBeGreaterThanOrEqual(0);
			});
		});
	});
});