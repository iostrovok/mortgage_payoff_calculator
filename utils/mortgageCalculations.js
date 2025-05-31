export const calculateMortgageDetails = (principal, annualRate, termYears, additionalPayment = 0, startDate = new Date()) => {
	const monthlyRate = annualRate / 100 / 12;
	const originalTermMonths = termYears * 12;

	// Calculate original monthly payment (P&I)
	const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, originalTermMonths)) /
						   (Math.pow(1 + monthlyRate, originalTermMonths) - 1);

	// Handle past start dates by calculating payments already made
	const today = new Date();
	const loanStartDate = new Date(startDate);

	let adjustedPrincipal = principal;
	let adjustedTermMonths = originalTermMonths;
	let paymentsMade = 0;

	if (loanStartDate < today) {
		// Calculate how many months have passed since loan start
		const monthsPassed = (today.getFullYear() - loanStartDate.getFullYear()) * 12 + (today.getMonth() - loanStartDate.getMonth());

		if (monthsPassed > 0 && monthsPassed < originalTermMonths) {
			// Generate amortization schedule for past payments to find current balance
			const pastSchedule = generateAmortizationSchedule(principal, monthlyRate, monthsPassed, monthlyPayment, loanStartDate);

			if (pastSchedule.length > 0) {
				// Get the remaining balance after past payments
				adjustedPrincipal = pastSchedule[pastSchedule.length - 1].balance;
				adjustedTermMonths = originalTermMonths - monthsPassed;
				paymentsMade = monthsPassed;
			}
		} else if (monthsPassed >= originalTermMonths) {
			// Loan would already be paid off
			adjustedPrincipal = 0;
			adjustedTermMonths = 0;
		}
	}

	// If loan is already paid off, return early
	if (adjustedPrincipal <= 0 || adjustedTermMonths <= 0) {
		return {
			originalSchedule: [],
			acceleratedSchedule: [],
			monthlyPayment,
			originalTotalInterest: 0,
			acceleratedTotalInterest: 0,
			interestSaved: 0,
			monthsSaved: 0,
			originalPayoffDate: loanStartDate,
			acceleratedPayoffDate: loanStartDate,
			currentBalance: 0,
			remainingTerm: 0,
			paymentsMade,
			isAlreadyPaidOff: true,
		};
	}

	// Generate schedules starting from today with adjusted values
	const currentDate = new Date(today);

	// Generate original schedule from current date with remaining balance and term
	const originalSchedule = generateAmortizationSchedule(adjustedPrincipal, monthlyRate, adjustedTermMonths, monthlyPayment, currentDate);

	// Generate schedule with additional payments
	const acceleratedSchedule = generateAmortizationSchedule(adjustedPrincipal, monthlyRate, adjustedTermMonths,
		monthlyPayment + additionalPayment, currentDate, true);

	// Calculate savings
	const originalTotalInterest = originalSchedule.reduce((sum, payment) => sum + payment.interest, 0);
	const acceleratedTotalInterest = acceleratedSchedule.reduce((sum, payment) => sum + payment.interest, 0);
	const interestSaved = originalTotalInterest - acceleratedTotalInterest;

	// Calculate time saved
	const originalPayoffDate = originalSchedule.length > 0 ? originalSchedule[originalSchedule.length - 1].date : currentDate;
	const acceleratedPayoffDate = acceleratedSchedule.length > 0 ? acceleratedSchedule[acceleratedSchedule.length - 1].date : currentDate;
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
		acceleratedPayoffDate, currentBalance: adjustedPrincipal, remainingTerm: Math.round(adjustedTermMonths / 12 * 10) / 10, // Round to
																																// 1
																																// decimal
																																// place
		paymentsMade, isAlreadyPaidOff: false,
	};
};

const generateAmortizationSchedule = (principal, monthlyRate, maxPayments, monthlyPayment, startDate, allowEarlyPayoff = false) => {
	const schedule = [];
	let remainingBalance = principal;
	let currentDate = new Date(startDate);
	let paymentNumber = 0;

	while (remainingBalance > 0.01 && paymentNumber < maxPayments) {
		const interestPayment = remainingBalance * monthlyRate;
		let principalPayment = monthlyPayment - interestPayment;

		// If this would pay off the loan, adjust the principal payment
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

		// Move to next month
		currentDate.setMonth(currentDate.getMonth() + 1);

		// Break if balance is essentially zero
		if (remainingBalance <= 0.01) break;

		// For accelerated schedules, allow early payoff
		if (allowEarlyPayoff && remainingBalance <= 0.01) break;
	}

	return schedule;
};

export const formatCurrency = (amount) => {
	return new Intl.NumberFormat('en-US', {
		style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0,
	}).format(amount);
};

export const formatDate = (date) => {
	return date.toLocaleDateString('en-US', {
		year: 'numeric', month: 'long', day: 'numeric',
	});
};

export const parseNaturalLanguageQuery = (query, currentMortgageData) => {
	const lowerQuery = query.toLowerCase();

	// Extract dollar amounts
	const dollarMatch = lowerQuery.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
	const amount = dollarMatch ? parseFloat(dollarMatch[1].replace(/,/g, '')) : null;

	// Extract years
	const yearMatch = lowerQuery.match(/(\d+)\s*years?/);
	const years = yearMatch ? parseInt(yearMatch[1]) : null;

	// Determine query type and generate response
	if (lowerQuery.includes('sooner') || lowerQuery.includes('earlier') || lowerQuery.includes('faster')) {
		if (amount && currentMortgageData) {
			const result = calculateMortgageDetails(currentMortgageData.principal, currentMortgageData.rate, currentMortgageData.term,
				amount, currentMortgageData.startDate);

			if (result.isAlreadyPaidOff) {
				return 'Your mortgage appears to be already paid off based on the start date provided.';
			}

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

			let responseText = `Adding ${formatCurrency(
				amount)} per month would allow you to pay off your mortgage ${timeString} sooner, saving you ${formatCurrency(
				result.interestSaved)} in total interest.`;

			if (result.paymentsMade > 0) {
				responseText += ` (Based on your current balance of ${formatCurrency(
					result.currentBalance)} after ${result.paymentsMade} payments already made)`;
			}

			return responseText;
		}
	}

	if (lowerQuery.includes('total interest') || lowerQuery.includes('interest save')) {
		if (amount && currentMortgageData) {
			const result = calculateMortgageDetails(currentMortgageData.principal, currentMortgageData.rate, currentMortgageData.term,
				amount, currentMortgageData.startDate);

			if (result.isAlreadyPaidOff) {
				return 'Your mortgage appears to be already paid off based on the start date provided.';
			}

			let responseText = `With an additional ${formatCurrency(amount)} per month, you would save ${formatCurrency(
				result.interestSaved)} in total interest over the life of your loan.`;

			if (result.paymentsMade > 0) {
				responseText += ` (Based on your current balance of ${formatCurrency(result.currentBalance)})`;
			}

			return responseText;
		}
	}

	if (lowerQuery.includes('finish') || lowerQuery.includes('pay off')) {
		if (years && currentMortgageData) {
			const currentResult = calculateMortgageDetails(currentMortgageData.principal, currentMortgageData.rate,
				currentMortgageData.term, 0, currentMortgageData.startDate);

			if (currentResult.isAlreadyPaidOff) {
				return 'Your mortgage appears to be already paid off based on the start date provided.';
			}

			// Calculate required additional payment to finish in X years from now
			const targetMonths = years * 12;
			const monthlyRate = currentMortgageData.rate / 100 / 12;

			// Use current balance for calculations
			const currentBalance = currentResult.currentBalance;

			if (targetMonths <= 0) {
				return 'Please specify a positive number of years for payoff.';
			}

			const requiredPayment = currentBalance * (monthlyRate * Math.pow(1 + monthlyRate, targetMonths)) /
									(Math.pow(1 + monthlyRate, targetMonths) - 1);

			const additionalNeeded = requiredPayment - currentResult.monthlyPayment;

			if (additionalNeeded > 0) {
				let responseText = `To pay off your mortgage in ${years} years from today, you would need to add approximately ${formatCurrency(
					additionalNeeded)} per month to your payments.`;

				if (currentResult.paymentsMade > 0) {
					responseText += ` (Based on your current balance of ${formatCurrency(currentBalance)})`;
				}

				return responseText;
			} else {
				return `Great news! Your current payment schedule will already pay off your mortgage in less than ${years} years from today.`;
			}
		}
	}

	return 'I\'d be happy to help with your mortgage calculations! Please ask about additional payments, time savings, or interest savings.';
};