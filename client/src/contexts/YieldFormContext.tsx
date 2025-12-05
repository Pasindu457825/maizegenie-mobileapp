/**
 * Yield Prediction Form Context
 * Manages form state across multiple screens
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  YieldPredictionFormData,
  INITIAL_FORM_DATA,
  ValidationErrors,
} from '../types/yieldPrediction';

interface YieldFormContextType {
  formData: YieldPredictionFormData;
  errors: ValidationErrors;
  language: 'si' | 'en';
  updateFormData: (data: Partial<YieldPredictionFormData>) => void;
  setErrors: (errors: ValidationErrors) => void;
  clearErrors: () => void;
  resetForm: () => void;
  setLanguage: (lang: 'si' | 'en') => void;
}

const YieldFormContext = createContext<YieldFormContextType | undefined>(undefined);

interface YieldFormProviderProps {
  children: ReactNode;
}

export const YieldFormProvider: React.FC<YieldFormProviderProps> = ({ children }) => {
  const [formData, setFormData] = useState<YieldPredictionFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [language, setLanguage] = useState<'si' | 'en'>('en');

  const updateFormData = (data: Partial<YieldPredictionFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
    
    // Clear errors for updated fields
    const updatedKeys = Object.keys(data);
    if (updatedKeys.length > 0) {
      setErrors(prev => {
        const newErrors = { ...prev };
        updatedKeys.forEach(key => {
          delete newErrors[key as keyof YieldPredictionFormData];
        });
        return newErrors;
      });
    }
  };

  const clearErrors = () => {
    setErrors({});
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
  };

  return (
    <YieldFormContext.Provider
      value={{
        formData,
        errors,
        language,
        updateFormData,
        setErrors,
        clearErrors,
        resetForm,
        setLanguage,
      }}
    >
      {children}
    </YieldFormContext.Provider>
  );
};

export const useYieldForm = (): YieldFormContextType => {
  const context = useContext(YieldFormContext);
  if (!context) {
    throw new Error('useYieldForm must be used within YieldFormProvider');
  }
  return context;
};
