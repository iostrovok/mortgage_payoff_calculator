import {calculateMortgageDetails, formatCurrency, formatDate, parseNaturalLanguageQuery} from '../utils/mortgageCalculations';

describe('Mortgage Calculations', () => {
	describe('calculateMortgageDetails', () => {
		// Mock current date for consistent tests
		const mockToday = new Date('2024-01-01');
		const originalDate = Date;

		beforeEach(() => {
			global.Date = jest.fn((...args) => {
				if (args.length === 0) {
					return new originalDate(mockToday);
				}
				return new originalDate(...args);
			});
			global.Date.now = originalDate.now;
		});

		afterEach(() => {
			global.Date = originalDate;
		});

		const testMortgage = {
			principal: 300000, annualRate: 6.5, termYears: 30, startDate: new Date('2024-01-01'),
		};

		test('should calculate basic mortgage details correctly', () => {
			const result = calculateMortgageDetails(testMortgage.principal, testMortgage.annualRate, testMortgage.termYears, 0,
				testMortgage.startDate);

			expect(result.monthlyPayment).toBeCloseTo(1896.20, 2);
			expect(result.originalSchedule).toHaveLength(360); // 30 years * 12 months
			expect(result.originalTotalInterest).toBeGreaterThan(0);
			expect(result.originalPayoffDate).toBeInstanceOf(originalDate);
			expect(result.paymentsMade).toBe(0); // Future/current date
			expect(result.currentBalance).toBe(300000);
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

	describe('Past Start Date Handling', () => {
		// Mock Date to ensure consistent test results
		const mockToday = new Date('2024-06-01');
		const originalDate = Date;

		beforeEach(() => {
			global.Date = jest.fn((...args) => {
				if (args.length === 0) {
					return new originalDate(mockToday);
				}
				return new originalDate(...args);
			});
			global.Date.now = originalDate.now;
		});

		afterEach(() => {
			global.Date = originalDate;
		});

		test('should handle loan with past start date correctly', () => {
			// Loan started 12 months ago
			const pastStartDate = new Date('2023-06-01');
			const result = calculateMortgageDetails(300000, 6.5, 30, 0, pastStartDate);

			// Should have adjusted values
			expect(result.paymentsMade).toBe(12);
			expect(result.currentBalance).toBeLessThan(300000);
			expect(result.remainingTerm).toBeCloseTo(29, 1);
			expect(result.isAlreadyPaidOff).toBe(false);

			// Should have proper schedules starting from current date
			expect(result.originalSchedule.length).toBeLessThan(360); // Less than original 30-year term
			expect(result.originalSchedule.length).toBe(348); // 29 years remaining
		});

		test('should detect already paid off loan', () => {
			// Loan started 31 years ago (longer than 30-year term)
			const oldStartDate = new Date('1993-01-01');
			const result = calculateMortgageDetails(300000, 6.5, 30, 0, oldStartDate);

			expect(result.isAlreadyPaidOff).toBe(true);
			expect(result.currentBalance).toBe(0);
			expect(result.remainingTerm).toBe(0);
			expect(result.paymentsMade).toBeGreaterThanOrEqual(360); // At least full term
			expect(result.originalSchedule).toHaveLength(0);
			expect(result.acceleratedSchedule).toHaveLength(0);
		});

		test('should handle future start date as normal', () => {
			// Future start date should work like before
			const futureStartDate = new Date('2025-01-01');
			const result = calculateMortgageDetails(300000, 6.5, 30, 0, futureStartDate);

			expect(result.paymentsMade).toBe(0);
			expect(result.currentBalance).toBe(300000);
			expect(result.remainingTerm).toBe(30);
			expect(result.isAlreadyPaidOff).toBe(false);
			expect(result.originalSchedule.length).toBe(360);
		});

		test('should calculate additional payments correctly with past start date', () => {
			// Loan started 24 months ago with additional payments
			const pastStartDate = new Date('2022-06-01');
			const result = calculateMortgageDetails(300000, 6.5, 30, 300, pastStartDate);

			expect(result.paymentsMade).toBe(24);
			expect(result.currentBalance).toBeLessThan(300000);
			expect(result.remainingTerm).toBeCloseTo(28, 1);
			expect(result.interestSaved).toBeGreaterThan(0);
			expect(result.monthsSaved).toBeGreaterThan(0);
			expect(result.acceleratedSchedule.length).toBeLessThan(result.originalSchedule.length);
		});

		test('should return proper remaining term calculations', () => {
			// Test various past start dates
			const testCases = [
				{ monthsAgo: 6, expectedRemainingTerm: 29.5 },
				{ monthsAgo: 12, expectedRemainingTerm: 29 },
				{ monthsAgo: 24, expectedRemainingTerm: 28 },
				{ monthsAgo: 60, expectedRemainingTerm: 25 },
			];

			testCases.forEach(({ monthsAgo, expectedRemainingTerm }) => {
				// Create dates that will result in exactly monthsAgo difference
				// Use day 1 to avoid day-of-month rollover issues
				let pastYear = mockToday.getFullYear();
				let pastMonth = mockToday.getMonth() - monthsAgo;
				
				// Handle year boundary crossing
				while (pastMonth < 0) {
					pastMonth += 12;
					pastYear--;
				}
				
				const pastDate = new Date(pastYear, pastMonth, 1);
				
				const result = calculateMortgageDetails(300000, 6.5, 30, 0, pastDate);
				
				expect(result.paymentsMade).toBe(monthsAgo);
				expect(result.remainingTerm).toBeCloseTo(expectedRemainingTerm, 1);
			});
		});
	});

	describe('Natural Language Query with Past Dates', () => {
		const mockMortgageDataPast = {
			principal: 300000,
			rate: 6.5,
			term: 30,
			startDate: new Date('2022-01-01'), // 2+ years ago
		};

		test('should handle "sooner" queries with past start date context', () => {
			const query = 'How much sooner if I add $300 per month?';
			const result = parseNaturalLanguageQuery(query, mockMortgageDataPast);

			expect(result).toContain('$300');
			expect(result).toContain('sooner');
			expect(result).toContain('current balance');
			expect(result).toContain('payments already made');
		});

		test('should handle interest saving queries with past start date', () => {
			const query = 'How much total interest will I save with $500 extra?';
			const result = parseNaturalLanguageQuery(query, mockMortgageDataPast);

			expect(result).toContain('$500');
			expect(result).toContain('save');
			expect(result).toContain('current balance');
		});

		test('should handle payoff time queries with current balance', () => {
			const query = 'Can I pay off in 15 years?';
			const result = parseNaturalLanguageQuery(query, mockMortgageDataPast);

			expect(result).toContain('15 years');
			expect(result).toContain('from today');
			expect(result).toContain('current balance');
		});

		test('should detect already paid off loans in queries', () => {
			const paidOffMortgageData = {
				principal: 300000,
				rate: 6.5,
				term: 30,
				startDate: new Date('1990-01-01'), // Over 30 years ago
			};

			const query = 'How much sooner if I add $300 per month?';
			const result = parseNaturalLanguageQuery(query, paidOffMortgageData);

			expect(result).toContain('already paid off');
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

		test('should validate new return properties', () => {
			const result = calculateMortgageDetails(300000, 6.5, 30, 200, new Date('2024-01-01'));

			// Check new properties exist and have correct types
			expect(typeof result.currentBalance).toBe('number');
			expect(typeof result.remainingTerm).toBe('number');
			expect(typeof result.paymentsMade).toBe('number');
			expect(typeof result.isAlreadyPaidOff).toBe('boolean');

			// Validate value ranges
			expect(result.currentBalance).toBeGreaterThanOrEqual(0);
			expect(result.remainingTerm).toBeGreaterThanOrEqual(0);
			expect(result.paymentsMade).toBeGreaterThanOrEqual(0);
		});
	});
});