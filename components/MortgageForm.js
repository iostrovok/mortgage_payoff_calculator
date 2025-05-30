import React, {useState} from 'react';
import {KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';

const MortgageForm = ({onSubmit}) => {
	const [formData, setFormData] = useState({
		loanAmount: '', interestRate: '', loanTerm: '', additionalPayment: '', startDate: new Date().toISOString().split('T')[0],
	});

	const [errors, setErrors] = useState({});

	const validateForm = () => {
		const newErrors = {};

		if (!formData.loanAmount || isNaN(formData.loanAmount) || parseFloat(formData.loanAmount) <= 0) {
			newErrors.loanAmount = 'Please enter a valid loan amount';
		}

		if (!formData.interestRate || isNaN(formData.interestRate) || parseFloat(formData.interestRate) <= 0) {
			newErrors.interestRate = 'Please enter a valid interest rate';
		}

		if (!formData.loanTerm || isNaN(formData.loanTerm) || parseFloat(formData.loanTerm) <= 0) {
			newErrors.loanTerm = 'Please enter a valid loan term';
		}

		if (formData.additionalPayment && (isNaN(formData.additionalPayment) || parseFloat(formData.additionalPayment) < 0)) {
			newErrors.additionalPayment = 'Please enter a valid additional payment amount';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = () => {
		if (validateForm()) {
			const data = {
				principal: parseFloat(formData.loanAmount),
				rate: parseFloat(formData.interestRate),
				term: parseFloat(formData.loanTerm),
				additionalPayment: parseFloat(formData.additionalPayment) || 0,
				startDate: new Date(formData.startDate),
			};
			onSubmit(data);
		}
	};

	const updateField = (field, value) => {
		setFormData(prev => ({...prev, [field]: value}));
		if (errors[field]) {
			setErrors(prev => ({...prev, [field]: null}));
		}
	};

	return (<KeyboardAvoidingView
		behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
		style={styles.container}
	>
		<ScrollView contentContainerStyle={styles.scrollContainer}>
			<Text style={styles.title}>Mortgage Calculator</Text>

			<View style={styles.inputGroup}>
				<Text style={styles.label}>Loan Amount ($)</Text>
				<TextInput
					style={[styles.input, errors.loanAmount && styles.errorInput]}
					value={formData.loanAmount}
					onChangeText={(value) => updateField('loanAmount', value)}
					placeholder="e.g., 350000"
					keyboardType="numeric"
				/>
				{errors.loanAmount && <Text style={styles.errorText}>{errors.loanAmount}</Text>}
			</View>

			<View style={styles.inputGroup}>
				<Text style={styles.label}>Annual Interest Rate (%)</Text>
				<TextInput
					style={[styles.input, errors.interestRate && styles.errorInput]}
					value={formData.interestRate}
					onChangeText={(value) => updateField('interestRate', value)}
					placeholder="e.g., 6.5"
					keyboardType="numeric"
				/>
				{errors.interestRate && <Text style={styles.errorText}>{errors.interestRate}</Text>}
			</View>

			<View style={styles.inputGroup}>
				<Text style={styles.label}>Loan Term (years)</Text>
				<TextInput
					style={[styles.input, errors.loanTerm && styles.errorInput]}
					value={formData.loanTerm}
					onChangeText={(value) => updateField('loanTerm', value)}
					placeholder="e.g., 30"
					keyboardType="numeric"
				/>
				{errors.loanTerm && <Text style={styles.errorText}>{errors.loanTerm}</Text>}
			</View>

			<View style={styles.inputGroup}>
				<Text style={styles.label}>Additional Monthly Payment ($)</Text>
				<TextInput
					style={[styles.input, errors.additionalPayment && styles.errorInput]}
					value={formData.additionalPayment}
					onChangeText={(value) => updateField('additionalPayment', value)}
					placeholder="e.g., 200 (optional)"
					keyboardType="numeric"
				/>
				{errors.additionalPayment && <Text style={styles.errorText}>{errors.additionalPayment}</Text>}
			</View>

			<View style={styles.inputGroup}>
				<Text style={styles.label}>Loan Start Date</Text>
				<TextInput
					style={styles.input}
					value={formData.startDate}
					onChangeText={(value) => updateField('startDate', value)}
					placeholder="YYYY-MM-DD"
				/>
			</View>

			<TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
				<Text style={styles.submitButtonText}>Calculate Payoff</Text>
			</TouchableOpacity>
		</ScrollView>
	</KeyboardAvoidingView>);
};

const styles = StyleSheet.create({
	container: {
		flex: 1, backgroundColor: '#f5f5f5',
	}, scrollContainer: {
		padding: 20, paddingBottom: 40,
	}, title: {
		fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 30, textAlign: 'center',
	}, inputGroup: {
		marginBottom: 20,
	}, label: {
		fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8,
	}, input: {
		backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 15, fontSize: 16, color: '#333',
	}, errorInput: {
		borderColor: '#ff3333',
	}, errorText: {
		color: '#ff3333', fontSize: 14, marginTop: 5,
	}, submitButton: {
		backgroundColor: '#007AFF', borderRadius: 8, padding: 18, alignItems: 'center', marginTop: 20,
	}, submitButtonText: {
		color: '#fff', fontSize: 18, fontWeight: '600',
	},
});

export default MortgageForm;