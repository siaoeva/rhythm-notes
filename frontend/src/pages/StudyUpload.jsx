import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadStudyMaterial } from '../services/api'; // Your API service
import './StudyUpload.css';

const StudyUpload = () => {
    const navigate = useNavigate();
    const fileInputRef = React.useRef(null);
    const [activeTab, setActiveTab] = useState('upload');
    const [title, setTitle] = useState('');
    const [file, setFile] = useState(null);
    const [textContent, setTextContent] = useState('');
    const [uploadedItems, setUploadedItems] = useState([]);
    const [summary, setSummary] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [extractedText, setExtractedText] = useState('');
    const [processingStatus, setProcessingStatus] = useState('');

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError(null);
        }
    };

    const processUpload = async () => {
        if (!title.trim()) {
            alert('Please enter a title for your notes');
            return;
        }

        if (!file) {
            alert('Please select a file');
            return;
        }

        setIsLoading(true);
        setError(null);
        setProcessingStatus('Uploading file...');

        try {
            setProcessingStatus('Extracting text from document...');
            
            // Call the backend API
            const response = await uploadStudyMaterial(file, 100);

            // Debug: Log the full response
            console.log('📥 Backend response:', response);
            console.log('📥 Response status:', response.status);
            console.log('📥 Response text length:', response.text?.length || 0);
            console.log('📥 Response summary length:', response.summary?.length || 0);
            console.log('📥 Response words:', response.words);

            setProcessingStatus('Generating summary...');

            // Check if we have valid data (with or without status field)
            if (response && (response.text || response.summary)) {
                // Create new item with actual data
                const newItem = {
                    id: uploadedItems.length + 1,
                    title: title,
                    type: file.name.split('.').pop() || 'file',
                    date: new Date().toLocaleDateString(),
                    icon: getFileIcon(file.name),
                    extractedText: response.text || '',
                    summary: response.summary || ''
                };
                
                setUploadedItems([newItem, ...uploadedItems]);
                setExtractedText(response.text || '');

                // Always set summary if we have either summary or text
                const summaryContent = response.summary || response.text;
                const keyPoints = extractKeyPoints(summaryContent);
                
                console.log('✅ Setting summary state:', {
                    title,
                    content: summaryContent,
                    keyPointsLength: keyPoints.length,
                    wordCount: response.words,
                    characterCount: response.characters
                });
                
                setSummary({
                    title: title,
                    content: summaryContent,
                    keyPoints: keyPoints.length > 0 ? keyPoints : [summaryContent],
                    wordCount: response.words || (response.text ? response.text.split(' ').length : 0),
                    characterCount: response.characters || (response.text ? response.text.length : 0),
                    estimatedReadTime: calculateReadTime(response.words || (response.text ? response.text.split(' ').length : 0))
                });
                
                console.log('✅ Summary state set successfully');

                // Reset form
                setFile(null);
                setTitle('');
                setActiveTab('upload');
                
                console.log('✅ Upload successful!');
            } else {
                throw new Error('No data received from server');
            }
        } catch (err) {
            console.error('❌ Upload error:', err);
            console.error('❌ Error details:', JSON.stringify(err, null, 2));
            
            const errorMessage = err?.error || err?.message || 'Failed to process document. Please try again.';
            setError(errorMessage);
            setProcessingStatus('');
        } finally {
            setIsLoading(false);
            setProcessingStatus('');
        }
    };

    const handleTextSubmit = async () => {
        if (!title.trim() || !textContent.trim()) {
            alert('Please enter both title and text content');
            return;
        }

        setIsLoading(true);
        setError(null);
        setProcessingStatus('Processing text...');

        try {
            // Create a text file from the content
            const blob = new Blob([textContent], { type: 'text/plain' });
            const textFile = new File([blob], `${title}.txt`, { type: 'text/plain' });

            // Call the backend API
            const response = await uploadStudyMaterial(textFile, 100);

            if (response.status === 'success') {
                const newItem = {
                    id: uploadedItems.length + 1,
                    title: title,
                    type: 'text',
                    date: new Date().toLocaleDateString(),
                    icon: '📝',
                    extractedText: response.text,
                    summary: response.summary
                };
                
                setUploadedItems([newItem, ...uploadedItems]);

                if (response.summary) {
                    setSummary({
                        title: title,
                        content: response.summary,
                        keyPoints: extractKeyPoints(response.summary),
                        wordCount: response.words,
                        characterCount: response.characters,
                        estimatedReadTime: calculateReadTime(response.words)
                    });
                } else {
                    setSummary({
                        title: title,
                        content: response.text,
                        keyPoints: ['Text is too short to generate a summary'],
                        wordCount: response.words,
                        characterCount: response.characters,
                        estimatedReadTime: calculateReadTime(response.words)
                    });
                }

                setTitle('');
                setTextContent('');
                setActiveTab('text');
            }
        } catch (err) {
            console.error('Text processing error:', err);
            setError(err.error || 'Failed to process text. Please try again.');
            setProcessingStatus('');
        } finally {
            setIsLoading(false);
            setProcessingStatus('');
        }
    };

    // Helper function to get file icon
    const getFileIcon = (filename) => {
        const ext = filename.split('.').pop().toLowerCase();
        const iconMap = {
            pdf: '📄',
            png: '🖼️',
            jpg: '🖼️',
            jpeg: '🖼️',
            gif: '🖼️',
            txt: '📝'
        };
        return iconMap[ext] || '📄';
    };

    // Helper function to extract key points from summary
    const extractKeyPoints = (summaryText) => {
        if (!summaryText || summaryText.trim().length === 0) {
            return ['No summary available'];
        }
        
        // Split by sentences (., !, ?)
        const sentences = summaryText
            .split(/[.!?]+/)
            .map(s => s.trim())
            .filter(s => s.length > 15); // Filter out very short fragments
        
        // If we have good sentences, return them
        if (sentences.length > 0) {
            return sentences.slice(0, 5); // Take first 5 sentences as key points
        }
        
        // If no good sentences, split by newlines or commas
        const lines = summaryText
            .split(/[\n,]+/)
            .map(s => s.trim())
            .filter(s => s.length > 10);
        
        if (lines.length > 0) {
            return lines.slice(0, 5);
        }
        
        // Last resort: return the whole text as one point
        return [summaryText];
    };

    // Helper function to calculate read time
    const calculateReadTime = (wordCount) => {
        const avgWordsPerMinute = 200;
        const minutes = Math.ceil(wordCount / avgWordsPerMinute);
        
        if (minutes < 1) return '< 1 min';
        if (minutes === 1) return '1 min';
        return `${minutes} min`;
    };

    // Debug: Log summary state whenever it changes
    React.useEffect(() => {
        console.log('🔍 Summary state changed:', summary);
    }, [summary]);

    return (
        <div className="study-upload">
            <div className="upload-header">
                <button className="back-btn" onClick={() => navigate('/dashboard')}>←</button>
                <div>
                    <h1>Upload Study Materials</h1>
                    <p className="subtitle">Add PDFs, images, or text notes</p>
                </div>
            </div>

            {error && (
                <div className="error-banner">
                    <span>⚠️ {error}</span>
                    <button onClick={() => setError(null)}>✕</button>
                </div>
            )}

            <div className="upload-container">
                <div className="tabs">
                    <button 
                        className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
                        onClick={() => setActiveTab('upload')}
                    >
                        ⬆️ Upload File
                    </button>
                    <button 
                        className={`tab ${activeTab === 'text' ? 'active' : ''}`}
                        onClick={() => setActiveTab('text')}
                    >
                        📋 Paste Text
                    </button>
                </div>

                <div className="content-grid">
                    <div className="main-section">
                        {activeTab === 'upload' && (
                            <div className="tab-content">
                                <h2>Upload Your Files</h2>
                                <div className="form-group">
                                    <label>Title</label>
                                    <input
                                        type="text"
                                        placeholder="Enter a title for your notes..."
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>

                                <div className="drop-zone">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        id="file-input"
                                        onChange={handleFileSelect}
                                        accept=".pdf,.png,.jpg,.jpeg,.gif,.txt"
                                        style={{ display: 'none' }}
                                    />
                                    <label htmlFor="file-input" className="drop-zone-label">
                                        <div className="drop-icon">⬆️</div>
                                        <p className="drop-text">Drop your files here or click to browse</p>
                                        <p className="drop-hint">Supports PDF, images, and text files</p>
                                        
                                        <button type="button" className="browse-btn" onClick={() => fileInputRef.current.click()}>Choose File</button>
                                    </label>
                                    {file && (
                                        <div className="file-preview">
                                            <span>✓ {file.name}</span>
                                            <button 
                                                className="upload-submit-btn"
                                                onClick={processUpload}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? processingStatus || 'Processing...' : 'Upload & Summarize'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'text' && (
                            <div className="tab-content">
                                <h2>Paste Text Notes</h2>
                                <div className="form-group">
                                    <label>Title</label>
                                    <input
                                        type="text"
                                        placeholder="Enter a title for your notes..."
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Your Notes</label>
                                    <textarea
                                        placeholder="Paste or type your study notes here..."
                                        value={textContent}
                                        onChange={(e) => setTextContent(e.target.value)}
                                    />
                                </div>
                                <button 
                                    className="submit-btn"
                                    onClick={handleTextSubmit}
                                    disabled={isLoading}
                                >
                                    {isLoading ? processingStatus || 'Processing...' : 'Process & Summarize'}
                                </button>
                            </div>
                        )}
                    </div>

                </div>

                {summary ? (
                    <div className="summary-section">
                        <div className="summary-header">
                            <h3>📊 AI Summary</h3>
                            <span className="summary-meta">
                                {summary.wordCount} words • {summary.characterCount} chars • {summary.estimatedReadTime}
                            </span>
                        </div>
                        <div className="summary-content">
                            <h4>{summary.title}</h4>
                            
                            {summary.content && summary.content !== summary.title && (
                                <div className="summary-text">
                                    <h5>Summary:</h5>
                                    <p>{summary.content}</p>
                                </div>
                            )}
                            
                            {extractedText && extractedText !== summary.content && (
                                <div className="extracted-text-section">
                                    <h5>Extracted Text Preview:</h5>
                                    <div className="extracted-text">
                                        {extractedText.substring(0, 300)}
                                        {extractedText.length > 300 && '...'}
                                    </div>
                                </div>
                            )}
                            
                            {summary.keyPoints && summary.keyPoints.length > 0 && (
                                <div className="key-points">
                                    <h5>Key Points:</h5>
                                    {summary.keyPoints.map((point, idx) => (
                                        <div key={idx} className="key-point">
                                            <span className="point-bullet">•</span>
                                            <span>{point}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            <div className="summary-actions">
                                <button className="action-btn secondary">📥 Download as PDF</button>
                                <button
                                    className="action-btn primary"
                                    onClick={() => navigate('/notes')}
                                >
                                    🃏 Generate Flashcards
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{padding: '20px', background: '#f0f0f0', margin: '20px 0', borderRadius: '8px'}}>
                        <p>No summary data available. Summary state: {JSON.stringify(summary)}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudyUpload;