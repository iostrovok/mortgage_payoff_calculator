import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {formatCurrency, formatDate} from '../utils/mortgageCalculations';

const ResultsDisplay = ({results}) => {
	if (!results) {
		return null;
	}

	const {
			  monthlyPayment,
			  interestSaved,
			  monthsSaved,
			  originalPayoffDate,
			  acceleratedPayoffDate,
			  originalTotalInterest, acceleratedTotalInterest, currentBalance, remainingTerm, paymentsMade, isAlreadyPaidOff,
		  } = results;

	const yearsSaved = Math.floor(monthsSaved / 12);
	const remainingMonthsSaved = monthsSaved % 12;

	const formatTimeSaved = () => {
		if (yearsSaved > 0) {
			if (remainingMonthsSaved > 0) {
				return `${yearsSaved} year${yearsSaved > 1 ? 's' : ''} and ${remainingMonthsSaved} month${remainingMonthsSaved > 1
					? 's'
					: ''}`;
			}
			return `${yearsSaved} year${yearsSaved > 1 ? 's' : ''}`;
		}
		return `${remainingMonthsSaved} month${remainingMonthsSaved > 1 ? 's' : ''}`;
	};

	// Handle case where loan is already paid off
	if (isAlreadyPaidOff) {
		return (<ScrollView style={styles.container}>
			<Text style={styles.title}>Loan Status</Text>
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>✅ Loan Paid Off</Text>
				<Text style={styles.subtitle}>Your mortgage appears to be already paid off based on the start date provided.</Text>
			</View>
		</ScrollView>);
	}

	return (<ScrollView style={styles.container}>
		<Text style={styles.title}>Payoff Analysis Results</Text>

		{paymentsMade > 0 && (<View style={styles.section}>
			<Text style={styles.sectionTitle}>Current Loan Status</Text>
			<View style={styles.statusRow}>
				<Text style={styles.statusLabel}>Current Balance:</Text>
				<Text style={styles.statusValue}>{formatCurrency(currentBalance)}</Text>
			</View>
			<View style={styles.statusRow}>
				<Text style={styles.statusLabel}>Remaining Term:</Text>
				<Text style={styles.statusValue}>{remainingTerm} years</Text>
			</View>
			<View style={styles.statusRow}>
				<Text style={styles.statusLabel}>Payments Made:</Text>
				<Text style={styles.statusValue}>{paymentsMade} payments</Text>
			</View>
			<Text style={styles.subtitle}>Based on loan start date in the past</Text>
		</View>)}

		<View style={styles.section}>
			<Text style={styles.sectionTitle}>Monthly Payment</Text>
			<Text style={styles.value}>{formatCurrency(monthlyPayment)}</Text>
			<Text style={styles.subtitle}>Base mortgage payment (P&I)</Text>
		</View>

		<View style={styles.section}>
			<Text style={styles.sectionTitle}>Time Savings</Text>
			<Text style={styles.bigValue}>{formatTimeSaved()}</Text>
			<Text style={styles.subtitle}>Earlier payoff with additional payments</Text>
		</View>

		<View style={styles.section}>
			<Text style={styles.sectionTitle}>Interest Savings</Text>
			<Text style={styles.bigValue}>{formatCurrency(interestSaved)}</Text>
			<Text style={styles.subtitle}>Total interest saved over loan life</Text>
		</View>

		<View style={styles.comparisonContainer}>
			<View style={styles.comparisonSection}>
				<Text style={styles.comparisonTitle}>Original Schedule</Text>
				<View style={styles.comparisonItem}>
					<Text style={styles.comparisonLabel}>Payoff Date:</Text>
					<Text style={styles.comparisonValue}>{formatDate(originalPayoffDate)}</Text>
				</View>
				<View style={styles.comparisonItem}>
					<Text style={styles.comparisonLabel}>Total Interest:</Text>
					<Text style={styles.comparisonValue}>{formatCurrency(originalTotalInterest)}</Text>
				</View>
			</View>

			<View style={styles.comparisonSection}>
				<Text style={[styles.comparisonTitle, styles.acceleratedTitle]}>With Additional Payments</Text>
				<View style={styles.comparisonItem}>
					<Text style={styles.comparisonLabel}>Payoff Date:</Text>
					<Text style={[styles.comparisonValue, styles.acceleratedValue]}>
						{formatDate(acceleratedPayoffDate)}
					</Text>
				</View>
				<View style={styles.comparisonItem}>
					<Text style={styles.comparisonLabel}>Total Interest:</Text>
					<Text style={[styles.comparisonValue, styles.acceleratedValue]}>
						{formatCurrency(acceleratedTotalInterest)}
					</Text>
				</View>
			</View>
		</View>

		<View style={styles.summaryContainer}>
			<Text style={styles.summaryTitle}>Summary</Text>
			<Text style={styles.summaryText}>
				By making additional principal payments, you'll pay off your mortgage{' '}
				<Text style={styles.highlight}>{formatTimeSaved()}</Text> sooner and save{' '}
				<Text style={styles.highlight}>{formatCurrency(interestSaved)}</Text> in total interest.
			</Text>
		</View>
	</ScrollView>);
};

const styles = StyleSheet.create({
	container: {
		flex: 1, backgroundColor: '#f5f5f5', padding: 20,
	}, title: {
		fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 30, textAlign: 'center',
	}, section: {
		backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 15, alignItems: 'center', shadowColor: '#000', shadowOffset: {
			width: 0, height: 2,
		}, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5,
	}, sectionTitle: {
		fontSize: 16, fontWeight: '600', color: '#666', marginBottom: 8,
	}, value: {
		fontSize: 24, fontWeight: 'bold', color: '#333',
	}, bigValue: {
		fontSize: 28, fontWeight: 'bold', color: '#007AFF',
	}, subtitle: {
		fontSize: 14, color: '#888', marginTop: 5, textAlign: 'center',
	}, comparisonContainer: {
		backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 15, shadowColor: '#000', shadowOffset: {
			width: 0, height: 2,
		}, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5,
	}, comparisonSection: {
		marginBottom: 20,
	}, comparisonTitle: {
		fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12,
	}, acceleratedTitle: {
		color: '#007AFF',
	}, comparisonItem: {
		flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8,
	}, comparisonLabel: {
		fontSize: 16, color: '#666',
	}, comparisonValue: {
		fontSize: 16, fontWeight: '600', color: '#333',
	}, acceleratedValue: {
		color: '#007AFF',
	}, summaryContainer: {
		backgroundColor: '#e8f4f8', borderRadius: 12, padding: 20, marginBottom: 20,
	}, summaryTitle: {
		fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10,
	}, summaryText: {
		fontSize: 16, color: '#555', lineHeight: 24,
	}, highlight: {
		fontWeight: 'bold', color: '#007AFF',
	}, statusRow: {
		flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8,
	}, statusLabel: {
		fontSize: 16, color: '#666',
	}, statusValue: {
		fontSize: 16, fontWeight: '600', color: '#333',
	},
});

export default ResultsDisplay;