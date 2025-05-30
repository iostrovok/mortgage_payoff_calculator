import React from 'react';
import {
	View, Text, StyleSheet, Dimensions,
} from 'react-native';
import {LineChart} from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const PayoffChart = ({results}) => {
	if (!results || !results.originalSchedule || !results.acceleratedSchedule) {
		return null;
	}

	const {originalSchedule, acceleratedSchedule} = results;

	// Sample data points for chart (every 12 months to keep it readable)
	const sampleInterval = Math.max(1, Math.floor(originalSchedule.length / 20)); // Max 20 data points
	const originalData = originalSchedule.filter((_, index) => index % sampleInterval === 0 || index === originalSchedule.length - 1).
		map(payment => payment.balance);

	const acceleratedData = [];
	let acceleratedIndex = 0;

	for (let i = 0; i < originalData.length; i++) {
		const originalPaymentIndex = i * sampleInterval;

		// Find corresponding accelerated payment or use 0 if loan is paid off
		while (acceleratedIndex < acceleratedSchedule.length && acceleratedSchedule[acceleratedIndex].paymentNumber <=
			   originalPaymentIndex + 1) {
			acceleratedIndex++;
		}

		if (acceleratedIndex < acceleratedSchedule.length) {
			acceleratedData.push(acceleratedSchedule[acceleratedIndex - 1]?.balance || 0);
		} else {
			acceleratedData.push(0);
		}
	}

	// Ensure both arrays have the same length
	const maxLength = Math.max(originalData.length, acceleratedData.length);
	while (originalData.length < maxLength) originalData.push(0);
	while (acceleratedData.length < maxLength) acceleratedData.push(0);

	const chartData = {
		labels: originalData.map((_, index) => {
			const yearMark = Math.floor((index * sampleInterval) / 12);
			return yearMark % 5 === 0 ? `${yearMark}y` : '';
		}), datasets: [
			{
				data: originalData.map(balance => balance / 1000), // Convert to thousands
				color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`, strokeWidth: 3,
			}, {
				data: acceleratedData.map(balance => balance / 1000), // Convert to thousands
				color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`, strokeWidth: 3,
			}], legend: ['Original Schedule', 'With Additional Payments'],
	};

	const chartConfig = {
		backgroundColor: '#ffffff',
		backgroundGradientFrom: '#ffffff',
		backgroundGradientTo: '#ffffff',
		decimalPlaces: 0,
		color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
		labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
		style: {
			borderRadius: 16,
		},
		propsForDots: {
			r: '4', strokeWidth: '2',
		},
		formatYLabel: (value) => `$${value}K`,
	};

	return (<View style={styles.container}>
			<Text style={styles.title}>Loan Balance Over Time</Text>
			<Text style={styles.subtitle}>Comparison of payment schedules</Text>

			<View style={styles.chartContainer}>
				<LineChart
					data={chartData}
					width={screenWidth - 40}
					height={250}
					chartConfig={chartConfig}
					bezier
					style={styles.chart}
					fromZero
				/>
			</View>

			<View style={styles.legendContainer}>
				<View style={styles.legendItem}>
					<View style={[styles.legendColor, {backgroundColor: 'rgba(255, 99, 132, 1)'}]}/>
					<Text style={styles.legendText}>Original Schedule</Text>
				</View>
				<View style={styles.legendItem}>
					<View style={[styles.legendColor, {backgroundColor: 'rgba(54, 162, 235, 1)'}]}/>
					<Text style={styles.legendText}>With Additional Payments</Text>
				</View>
			</View>

			<Text style={styles.note}>
				Chart shows remaining loan balance over time (in thousands of dollars)
			</Text>
		</View>);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#fff', borderRadius: 12, padding: 20, margin: 20, shadowColor: '#000', shadowOffset: {
			width: 0, height: 2,
		}, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5,
	}, title: {
		fontSize: 20, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 5,
	}, subtitle: {
		fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20,
	}, chartContainer: {
		alignItems: 'center', marginBottom: 20,
	}, chart: {
		borderRadius: 16,
	}, legendContainer: {
		flexDirection: 'row', justifyContent: 'center', marginBottom: 15,
	}, legendItem: {
		flexDirection: 'row', alignItems: 'center', marginHorizontal: 15,
	}, legendColor: {
		width: 16, height: 16, borderRadius: 8, marginRight: 8,
	}, legendText: {
		fontSize: 14, color: '#333',
	}, note: {
		fontSize: 12, color: '#888', textAlign: 'center', fontStyle: 'italic',
	},
});

export default PayoffChart;