import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AIAssistant from '../components/AIAssistant';
import * as openaiService from '../utils/openaiService';

// Mock the openai service
jest.mock('../utils/openaiService');

describe('AIAssistant', () => {
  const mockMortgageData = {
    principal: 300000,
    rate: 6.5,
    term: 30,
    additionalPayment: 0,
    startDate: new Date('2024-01-01')
  };

  beforeEach(() => {
    jest.clearAllMocks();
    openaiService.getOpenAIResponse.mockResolvedValue('Mock AI response');
  });

  test('should render initial welcome message', () => {
    const { getByText } = render(<AIAssistant mortgageData={mockMortgageData} />);
    
    expect(getByText('AI Mortgage Assistant')).toBeTruthy();
    expect(getByText('Ask me about your mortgage scenarios')).toBeTruthy();
    expect(getByText(/Hi! I'm your mortgage assistant/)).toBeTruthy();
  });

  test('should show message when no mortgage data provided', () => {
    const { getByText } = render(<AIAssistant mortgageData={null} />);
    
    expect(getByText('Please fill out the mortgage form above to enable AI assistance')).toBeTruthy();
  });

  test('should render quick question buttons when mortgage data is available', () => {
    const { getByText } = render(<AIAssistant mortgageData={mockMortgageData} />);
    
    expect(getByText('Quick Questions:')).toBeTruthy();
    expect(getByText('How much sooner if I add $200 per month?')).toBeTruthy();
    expect(getByText('Can I pay off in 20 years?')).toBeTruthy();
    expect(getByText('What interest will I save with $500 extra?')).toBeTruthy();
    expect(getByText('How much to pay off in 15 years?')).toBeTruthy();
  });

  test('should render text input and send button when mortgage data is available', () => {
    const { getByPlaceholderText, getByText } = render(<AIAssistant mortgageData={mockMortgageData} />);
    
    expect(getByPlaceholderText('Ask about your mortgage...')).toBeTruthy();
    expect(getByText('Send')).toBeTruthy();
  });

  test('should update input text when typing', () => {
    const { getByPlaceholderText } = render(<AIAssistant mortgageData={mockMortgageData} />);
    
    const textInput = getByPlaceholderText('Ask about your mortgage...');
    fireEvent.changeText(textInput, 'How much sooner?');
    
    expect(textInput.props.value).toBe('How much sooner?');
  });

  test('should send message when send button is pressed', async () => {
    const { getByPlaceholderText, getByText } = render(<AIAssistant mortgageData={mockMortgageData} />);
    
    const textInput = getByPlaceholderText('Ask about your mortgage...');
    const sendButton = getByText('Send');
    
    fireEvent.changeText(textInput, 'Test question');
    fireEvent.press(sendButton);
    
    await waitFor(() => {
      expect(openaiService.getOpenAIResponse).toHaveBeenCalledWith('Test question', mockMortgageData);
    });
    
    // Check that user message appears
    expect(getByText('Test question')).toBeTruthy();
  });

  test('should send message when quick question button is pressed', async () => {
    const { getByText } = render(<AIAssistant mortgageData={mockMortgageData} />);
    
    const quickQuestion = getByText('How much sooner if I add $200 per month?');
    fireEvent.press(quickQuestion);
    
    await waitFor(() => {
      expect(openaiService.getOpenAIResponse).toHaveBeenCalledWith(
        'How much sooner if I add $200 per month?', 
        mockMortgageData
      );
    });
    
    // Check that question appears in messages
    expect(getByText('How much sooner if I add $200 per month?')).toBeTruthy();
  });

  test('should display AI response after sending message', async () => {
    openaiService.getOpenAIResponse.mockResolvedValue('You would save 5 years and $50,000');
    
    const { getByPlaceholderText, getByText } = render(<AIAssistant mortgageData={mockMortgageData} />);
    
    const textInput = getByPlaceholderText('Ask about your mortgage...');
    const sendButton = getByText('Send');
    
    fireEvent.changeText(textInput, 'Test question');
    fireEvent.press(sendButton);
    
    await waitFor(() => {
      expect(getByText('You would save 5 years and $50,000')).toBeTruthy();
    });
  });

  test('should show loading state while waiting for response', async () => {
    // Make the promise resolve after a delay
    openaiService.getOpenAIResponse.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve('Response'), 100))
    );
    
    const { getByPlaceholderText, getByText } = render(<AIAssistant mortgageData={mockMortgageData} />);
    
    const textInput = getByPlaceholderText('Ask about your mortgage...');
    const sendButton = getByText('Send');
    
    fireEvent.changeText(textInput, 'Test question');
    fireEvent.press(sendButton);
    
    // Should show loading state
    expect(getByText('AI is thinking...')).toBeTruthy();
    
    await waitFor(() => {
      expect(getByText('Response')).toBeTruthy();
    });
  });

  test('should handle API errors gracefully', async () => {
    openaiService.getOpenAIResponse.mockRejectedValue(new Error('API Error'));
    
    const { getByPlaceholderText, getByText } = render(<AIAssistant mortgageData={mockMortgageData} />);
    
    const textInput = getByPlaceholderText('Ask about your mortgage...');
    const sendButton = getByText('Send');
    
    fireEvent.changeText(textInput, 'Test question');
    fireEvent.press(sendButton);
    
    await waitFor(() => {
      expect(getByText('Sorry, I encountered an error processing your request. Please try again.')).toBeTruthy();
    });
  });

  test('should clear input after sending message', async () => {
    const { getByPlaceholderText, getByText } = render(<AIAssistant mortgageData={mockMortgageData} />);
    
    const textInput = getByPlaceholderText('Ask about your mortgage...');
    const sendButton = getByText('Send');
    
    fireEvent.changeText(textInput, 'Test question');
    fireEvent.press(sendButton);
    
    await waitFor(() => {
      expect(textInput.props.value).toBe('');
    });
  });

  test('should disable send button when input is empty', () => {
    const { getByPlaceholderText, getByText } = render(<AIAssistant mortgageData={mockMortgageData} />);
    
    const sendButton = getByText('Send');
    
    // Should be disabled when input is empty
    expect(sendButton.props.accessibilityState?.disabled).toBe(true);
  });

  test('should enable send button when input has text', () => {
    const { getByPlaceholderText, getByText } = render(<AIAssistant mortgageData={mockMortgageData} />);
    
    const textInput = getByPlaceholderText('Ask about your mortgage...');
    const sendButton = getByText('Send');
    
    fireEvent.changeText(textInput, 'Test');
    
    expect(sendButton.props.accessibilityState?.disabled).toBe(false);
  });

  test('should disable send button during loading', async () => {
    openaiService.getOpenAIResponse.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve('Response'), 100))
    );
    
    const { getByPlaceholderText, getByText } = render(<AIAssistant mortgageData={mockMortgageData} />);
    
    const textInput = getByPlaceholderText('Ask about your mortgage...');
    const sendButton = getByText('Send');
    
    fireEvent.changeText(textInput, 'Test question');
    fireEvent.press(sendButton);
    
    // Should be disabled during loading
    expect(sendButton.props.accessibilityState?.disabled).toBe(true);
    
    await waitFor(() => {
      expect(getByText('Response')).toBeTruthy();
    });
  });

  test('should not send empty or whitespace-only messages', () => {
    const { getByPlaceholderText, getByText } = render(<AIAssistant mortgageData={mockMortgageData} />);
    
    const textInput = getByPlaceholderText('Ask about your mortgage...');
    const sendButton = getByText('Send');
    
    // Try sending empty message
    fireEvent.changeText(textInput, '');
    fireEvent.press(sendButton);
    
    expect(openaiService.getOpenAIResponse).not.toHaveBeenCalled();
    
    // Try sending whitespace-only message
    fireEvent.changeText(textInput, '   ');
    fireEvent.press(sendButton);
    
    expect(openaiService.getOpenAIResponse).not.toHaveBeenCalled();
  });

  test('should display message timestamps', () => {
    const { getByText } = render(<AIAssistant mortgageData={mockMortgageData} />);
    
    // Check that the welcome message has a timestamp
    // The timestamp format is HH:MM
    const timestampRegex = /\d{1,2}:\d{2}/;
    const timestampElements = getByText(timestampRegex);
    expect(timestampElements).toBeTruthy();
  });

  test('should handle text input character limit', () => {
    const { getByPlaceholderText } = render(<AIAssistant mortgageData={mockMortgageData} />);
    
    const textInput = getByPlaceholderText('Ask about your mortgage...');
    
    // Should have maxLength prop
    expect(textInput.props.maxLength).toBe(200);
  });

  test('should trim whitespace from messages before sending', async () => {
    const { getByPlaceholderText, getByText } = render(<AIAssistant mortgageData={mockMortgageData} />);
    
    const textInput = getByPlaceholderText('Ask about your mortgage...');
    const sendButton = getByText('Send');
    
    fireEvent.changeText(textInput, '  Test question  ');
    fireEvent.press(sendButton);
    
    await waitFor(() => {
      expect(openaiService.getOpenAIResponse).toHaveBeenCalledWith('Test question', mockMortgageData);
    });
  });
});