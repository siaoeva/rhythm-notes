// useDocumentProcessor.js
import { useState } from 'react';

export function useDocumentProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const processDocument = async (file, wordsLimit = 100) => {
    if (!file) {
      setError('No file provided');
      return null;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('words_limit', wordsLimit);

      const token = await getToken(); // Get auth token if needed
      const response = await fetch('/api/process-document', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`, // If using auth
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process document');
      }

      const data = await response.json();
      setResult(data);
      return data;
    } catch (err) {
      setError(err.message || 'An error occurred while processing the document');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return {
    processDocument,
    isProcessing,
    result,
    error,
    reset
  };
}