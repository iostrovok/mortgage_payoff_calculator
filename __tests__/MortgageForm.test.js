import React from 'react';
import {fireEvent, render, waitFor} from '@testing-library/react-native';
import MortgageForm from '../components/MortgageForm';

describe('MortgageForm', () => {
	const mockOnSubmit = jest.fn();

	beforeEach(() => {
		mockOnSubmit.mockClear();
	});

	test('should render all form fields', () => {
		const {getByPlaceholderText, getByText} = render(<MortgageForm onSubmit={mockOnSubmit}/>);

		expect(getByText('Mortgage Calculator')).toBeTruthy();
		expect(getByPlaceholderText('e.g., 350000')).toBeTruthy();
		expect(getByPlaceholderText('e.g., 6.5')).toBeTruthy();
		expect(getByPlaceholderText('e.g., 30')).toBeTruthy();
		expect(getByPlaceholderText('e.g., 200 (optional)')).toBeTruthy();
		expect(getByPlaceholderText('YYYY-MM-DD')).toBeTruthy();
		expect(getByText('Calculate Payoff')).toBeTruthy();
	});

	test('should update input values when typing', () => {
		const {getByPlaceholderText} = render(<MortgageForm onSubmit={mockOnSubmit}/>);

		const loanAmountInput = getByPlaceholderText('e.g., 350000');
		const interestRateInput = getByPlaceholderText('e.g., 6.5');
		const loanTermInput = getByPlaceholderText('e.g., 30');
		const additionalPaymentInput = getByPlaceholderText('e.g., 200 (optional)');

		fireEvent.changeText(loanAmountInput, '300000');
		fireEvent.changeText(interestRateInput, '6.5');
		fireEvent.changeText(loanTermInput, '30');
		fireEvent.changeText(additionalPaymentInput, '200');

		expect(loanAmountInput.props.value).toBe('300000');
		expect(interestRateInput.props.value).toBe('6.5');
		expect(loanTermInput.props.value).toBe('30');
		expect(additionalPaymentInput.props.value).toBe('200');
	});

	test('should validate required fields and show errors', async () => {
		const {getByText, getByPlaceholderText} = render(<MortgageForm onSubmit={mockOnSubmit}/>);

		const submitButton = getByText('Calculate Payoff');
		fireEvent.press(submitButton);

		await waitFor(() => {
			expect(getByText('Please enter a valid loan amount')).toBeTruthy();
			expect(getByText('Please enter a valid interest rate')).toBeTruthy();
			expect(getByText('Please enter a valid loan term')).toBeTruthy();
		});

		expect(mockOnSubmit).not.toHaveBeenCalled();
	});

	test('should validate numeric inputs', async () => {
		const {getByText, getByPlaceholderText} = render(<MortgageForm onSubmit={mockOnSubmit}/>);

		const loanAmountInput = getByPlaceholderText('e.g., 350000');
		const interestRateInput = getByPlaceholderText('e.g., 6.5');
		const loanTermInput = getByPlaceholderText('e.g., 30');

		fireEvent.changeText(loanAmountInput, 'not-a-number');
		fireEvent.changeText(interestRateInput, 'invalid');
		fireEvent.changeText(loanTermInput, 'text');

		const submitButton = getByText('Calculate Payoff');
		fireEvent.press(submitButton);

		await waitFor(() => {
			expect(getByText('Please enter a valid loan amount')).toBeTruthy();
			expect(getByText('Please enter a valid interest rate')).toBeTruthy();
			expect(getByText('Please enter a valid loan term')).toBeTruthy();
		});

		expect(mockOnSubmit).not.toHaveBeenCalled();
	});

	test('should validate positive numbers for required fields', async () => {
		const {getByText, getByPlaceholderText} = render(<MortgageForm onSubmit={mockOnSubmit}/>);

		const loanAmountInput = getByPlaceholderText('e.g., 350000');
		const interestRateInput = getByPlaceholderText('e.g., 6.5');
		const loanTermInput = getByPlaceholderText('e.g., 30');

		fireEvent.changeText(loanAmountInput, '-100000');
		fireEvent.changeText(interestRateInput, '0');
		fireEvent.changeText(loanTermInput, '-5');

		const submitButton = getByText('Calculate Payoff');
		fireEvent.press(submitButton);

		await waitFor(() => {
			expect(getByText('Please enter a valid loan amount')).toBeTruthy();
			expect(getByText('Please enter a valid interest rate')).toBeTruthy();
			expect(getByText('Please enter a valid loan term')).toBeTruthy();
		});

		expect(mockOnSubmit).not.toHaveBeenCalled();
	});

	test('should validate additional payment is non-negative', async () => {
		const {getByText, getByPlaceholderText} = render(<MortgageForm onSubmit={mockOnSubmit}/>);

		const additionalPaymentInput = getByPlaceholderText('e.g., 200 (optional)');
		fireEvent.changeText(additionalPaymentInput, '-100');

		const submitButton = getByText('Calculate Payoff');
		fireEvent.press(submitButton);

		await waitFor(() => {
			expect(getByText('Please enter a valid additional payment amount')).toBeTruthy();
		});
	});

	test('should submit valid form data', async () => {
		const {getByText, getByPlaceholderText} = render(<MortgageForm onSubmit={mockOnSubmit}/>);

		const loanAmountInput = getByPlaceholderText('e.g., 350000');
		const interestRateInput = getByPlaceholderText('e.g., 6.5');
		const loanTermInput = getByPlaceholderText('e.g., 30');
		const additionalPaymentInput = getByPlaceholderText('e.g., 200 (optional)');
		const startDateInput = getByPlaceholderText('YYYY-MM-DD');

		fireEvent.changeText(loanAmountInput, '300000');
		fireEvent.changeText(interestRateInput, '6.5');
		fireEvent.changeText(loanTermInput, '30');
		fireEvent.changeText(additionalPaymentInput, '200');
		fireEvent.changeText(startDateInput, '2024-01-01');

		const submitButton = getByText('Calculate Payoff');
		fireEvent.press(submitButton);

		await waitFor(() => {
			expect(mockOnSubmit).toHaveBeenCalledWith({
				principal: 300000, rate: 6.5, term: 30, additionalPayment: 200, startDate: expect.any(Date),
			});
		});
	});

	test('should submit with zero additional payment when field is empty', async () => {
		const {getByText, getByPlaceholderText} = render(<MortgageForm onSubmit={mockOnSubmit}/>);

		const loanAmountInput = getByPlaceholderText('e.g., 350000');
		const interestRateInput = getByPlaceholderText('e.g., 6.5');
		const loanTermInput = getByPlaceholderText('e.g., 30');

		fireEvent.changeText(loanAmountInput, '300000');
		fireEvent.changeText(interestRateInput, '6.5');
		fireEvent.changeText(loanTermInput, '30');

		const submitButton = getByText('Calculate Payoff');
		fireEvent.press(submitButton);

		await waitFor(() => {
			expect(mockOnSubmit).toHaveBeenCalledWith({
				principal: 300000, rate: 6.5, term: 30, additionalPayment: 0, startDate: expect.any(Date),
			});
		});
	});

	test('should clear errors when correcting invalid input', async () => {
		const {getByText, getByPlaceholderText, queryByText} = render(<MortgageForm onSubmit={mockOnSubmit}/>);

		const loanAmountInput = getByPlaceholderText('e.g., 350000');

		// Enter invalid value and submit to trigger error
		fireEvent.changeText(loanAmountInput, 'invalid');
		const submitButton = getByText('Calculate Payoff');
		fireEvent.press(submitButton);

		await waitFor(() => {
			expect(getByText('Please enter a valid loan amount')).toBeTruthy();
		});

		// Correct the value
		fireEvent.changeText(loanAmountInput, '300000');

		await waitFor(() => {
			expect(queryByText('Please enter a valid loan amount')).toBeNull();
		});
	});

	test('should handle decimal values correctly', async () => {
		const {getByText, getByPlaceholderText} = render(<MortgageForm onSubmit={mockOnSubmit}/>);

		const loanAmountInput = getByPlaceholderText('e.g., 350000');
		const interestRateInput = getByPlaceholderText('e.g., 6.5');
		const loanTermInput = getByPlaceholderText('e.g., 30');
		const additionalPaymentInput = getByPlaceholderText('e.g., 200 (optional)');

		fireEvent.changeText(loanAmountInput, '300000.50');
		fireEvent.changeText(interestRateInput, '6.25');
		fireEvent.changeText(loanTermInput, '30');
		fireEvent.changeText(additionalPaymentInput, '150.75');

		const submitButton = getByText('Calculate Payoff');
		fireEvent.press(submitButton);

		await waitFor(() => {
			expect(mockOnSubmit).toHaveBeenCalledWith({
				principal: 300000.50, rate: 6.25, term: 30, additionalPayment: 150.75, startDate: expect.any(Date),
			});
		});
	});

	test('should have default start date set to today', () => {
		const {getByPlaceholderText} = render(<MortgageForm onSubmit={mockOnSubmit}/>);

		const startDateInput = getByPlaceholderText('YYYY-MM-DD');
		const today = new Date().toISOString().split('T')[0];

		expect(startDateInput.props.value).toBe(today);
	});

	test('should handle zero additional payment correctly', async () => {
		const {getByText, getByPlaceholderText} = render(<MortgageForm onSubmit={mockOnSubmit}/>);

		const loanAmountInput = getByPlaceholderText('e.g., 350000');
		const interestRateInput = getByPlaceholderText('e.g., 6.5');
		const loanTermInput = getByPlaceholderText('e.g., 30');
		const additionalPaymentInput = getByPlaceholderText('e.g., 200 (optional)');

		fireEvent.changeText(loanAmountInput, '300000');
		fireEvent.changeText(interestRateInput, '6.5');
		fireEvent.changeText(loanTermInput, '30');
		fireEvent.changeText(additionalPaymentInput, '0');

		const submitButton = getByText('Calculate Payoff');
		fireEvent.press(submitButton);

		await waitFor(() => {
			expect(mockOnSubmit).toHaveBeenCalledWith({
				principal: 300000, rate: 6.5, term: 30, additionalPayment: 0, startDate: expect.any(Date),
			});
		});
	});
});