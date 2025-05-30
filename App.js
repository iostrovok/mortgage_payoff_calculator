import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ScrollView, SafeAreaView } from 'react-native';
import MortgageForm from './components/MortgageForm';
import ResultsDisplay from './components/ResultsDisplay';
import PayoffChart from './components/PayoffChart';
import AIAssistant from './components/AIAssistant';
import { calculateMortgageDetails } from './utils/mortgageCalculations';

export default function App() {
  const [mortgageData, setMortgageData] = useState(null);
  const [calculationResults, setCalculationResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);

  const handleMortgageSubmit = (data) => {
    setMortgageData(data);
    const results = calculateMortgageDetails(
      data.principal,
      data.rate,
      data.term,
      data.additionalPayment,
      data.startDate
    );
    setCalculationResults(results);
    setShowResults(true);
  };

  const toggleAssistant = () => {
    setShowAssistant(!showAssistant);
  };

  if (showAssistant) {
    return (
      <SafeAreaView style={styles.container}>
        <AIAssistant 
          mortgageData={mortgageData} 
          onBack={toggleAssistant}
        />
        <StatusBar style="light" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <MortgageForm onSubmit={handleMortgageSubmit} />
        
        {showResults && calculationResults && (
          <>
            <ResultsDisplay results={calculationResults} />
            <PayoffChart results={calculationResults} />
          </>
        )}
        
        {mortgageData && (
          <View style={styles.assistantButtonContainer}>
            <View style={styles.assistantButton}>
              <AIAssistant mortgageData={mortgageData} />
            </View>
          </View>
        )}
      </ScrollView>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  assistantButtonContainer: {
    margin: 20,
  },
  assistantButton: {
    height: 400,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
