export const calculateMortgageDetails = (principal, annualRate, termYears, additionalPayment = 0, startDate = new Date()) => {
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = termYears * 12;
  
  // Calculate original monthly payment (P&I)
  const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  
  // Generate original amortization schedule
  const originalSchedule = generateAmortizationSchedule(
    principal, monthlyRate, numberOfPayments, monthlyPayment, startDate
  );
  
  // Generate schedule with additional payments
  const acceleratedSchedule = generateAmortizationSchedule(
    principal, monthlyRate, numberOfPayments, monthlyPayment + additionalPayment, startDate, true
  );
  
  // Calculate savings
  const originalTotalInterest = originalSchedule.reduce((sum, payment) => sum + payment.interest, 0);
  const acceleratedTotalInterest = acceleratedSchedule.reduce((sum, payment) => sum + payment.interest, 0);
  const interestSaved = originalTotalInterest - acceleratedTotalInterest;
  
  // Calculate time saved
  const originalPayoffDate = originalSchedule[originalSchedule.length - 1].date;
  const acceleratedPayoffDate = acceleratedSchedule[acceleratedSchedule.length - 1].date;
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
    acceleratedPayoffDate
  };
};

const generateAmortizationSchedule = (principal, monthlyRate, maxPayments, monthlyPayment, startDate, allowEarlyPayoff = false) => {
  const schedule = [];
  let remainingBalance = principal;
  let currentDate = new Date(startDate);
  let paymentNumber = 0;
  
  while (remainingBalance > 0.01 && (!allowEarlyPayoff || paymentNumber < maxPayments)) {
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
      balance: Math.max(0, remainingBalance)
    });
    
    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + 1);
    
    // Break if balance is essentially zero
    if (remainingBalance <= 0.01) break;
  }
  
  return schedule;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
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
      const result = calculateMortgageDetails(
        currentMortgageData.principal,
        currentMortgageData.rate,
        currentMortgageData.term,
        amount,
        currentMortgageData.startDate
      );
      
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
      
      return `Adding ${formatCurrency(amount)} per month would allow you to pay off your mortgage ${timeString} sooner, saving you ${formatCurrency(result.interestSaved)} in total interest.`;
    }
  }
  
  if (lowerQuery.includes('total interest') || lowerQuery.includes('interest save')) {
    if (amount && currentMortgageData) {
      const result = calculateMortgageDetails(
        currentMortgageData.principal,
        currentMortgageData.rate,
        currentMortgageData.term,
        amount,
        currentMortgageData.startDate
      );
      
      return `With an additional ${formatCurrency(amount)} per month, you would save ${formatCurrency(result.interestSaved)} in total interest over the life of your loan.`;
    }
  }
  
  if (lowerQuery.includes('finish') || lowerQuery.includes('pay off')) {
    if (years && currentMortgageData) {
      // Calculate required additional payment to finish in X years
      const targetMonths = years * 12;
      const monthlyRate = currentMortgageData.rate / 100 / 12;
      const standardPayment = currentMortgageData.principal * 
        (monthlyRate * Math.pow(1 + monthlyRate, currentMortgageData.term * 12)) / 
        (Math.pow(1 + monthlyRate, currentMortgageData.term * 12) - 1);
      
      const requiredPayment = currentMortgageData.principal * 
        (monthlyRate * Math.pow(1 + monthlyRate, targetMonths)) / 
        (Math.pow(1 + monthlyRate, targetMonths) - 1);
      
      const additionalNeeded = requiredPayment - standardPayment;
      
      if (additionalNeeded > 0) {
        return `To pay off your mortgage in ${years} years, you would need to add approximately ${formatCurrency(additionalNeeded)} per month to your payments.`;
      } else {
        return `Great news! Your current payment schedule will already pay off your mortgage in less than ${years} years.`;
      }
    }
  }
  
  return "I'd be happy to help with your mortgage calculations! Please ask about additional payments, time savings, or interest savings.";
};