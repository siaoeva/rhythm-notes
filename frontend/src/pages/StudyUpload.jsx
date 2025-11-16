import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            procesUpload(selectedFile.name);
        }
    };

    const procesUpload = (fileName) => {
        if (!title.trim()) {
            alert('Please enter a title for your notes');
            return;
        }

        setIsLoading(true);
        // Simulate backend AI summary generation
        setTimeout(() => {
            const summaryData = {
                title: title,
                keyPoints: [
                    'Core concepts and fundamentals covered',
                    'Important definitions and terminology',
                    'Key equations and formulas',
                    'Main takeaways and applications'
                ],
                wordCount: 1250,
                estimatedReadTime: '5-7 min'
            };

            const newItem = {
                id: uploadedItems.length + 1,
                title: title,
                summary: summaryData,
                date: new Date().toLocaleDateString(),
                icon: '📊'
            };
            setUploadedItems([newItem, ...uploadedItems]);

            // Show AI summary
            setSummary(summaryData);

            setIsLoading(false);
            setFile(null);
            setTitle('');
            setTextContent('');
            setActiveTab('upload');
        }, 1200);
    };

    const handleTextSubmit = () => {
        if (!title.trim() || !textContent.trim()) {
            alert('Please enter both title and text content');
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            const summaryData = {
                title: title,
                keyPoints: [
                    'Main concepts extracted from your text',
                    'Important points highlighted by AI',
                    'Related topics and connections',
                    'Recommended study areas'
                ],
                wordCount: textContent.split(' ').length,
                estimatedReadTime: '3-5 min'
            };

            const newItem = {
                id: uploadedItems.length + 1,
                title: title,
                summary: summaryData,
                date: new Date().toLocaleDateString(),
                icon: '📊'
            };
            setUploadedItems([newItem, ...uploadedItems]);

            // Show AI summary
            setSummary(summaryData);

            setIsLoading(false);
            setTitle('');
            setTextContent('');
            setActiveTab('text');
        }, 1200);
    };

    const handleSummaryClick = (item) => {
        setSummary(item.summary);
    };

    return (
        <div className="study-upload">
            <div className="upload-header">
                <button className="back-btn" onClick={() => navigate('/dashboard')}>←</button>
                <div>
                    <h1>Upload Study Materials</h1>
                    <p className="subtitle">Add PDFs, images, or text notes</p>
                </div>
            </div>

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
                                                onClick={() => procesUpload(file.name)}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? 'Processing...' : 'Upload & Summarize'}
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
                                    {isLoading ? 'Processing...' : 'Process & Summarize'}
                                </button>
                            </div>
                        )}
                    </div>

                    <aside className="sidebar">
                        <div className="sidebar-header">
                            <h3>Previous Uploads</h3>
                            <span className="badge">{uploadedItems.length}</span>
                        </div>
                        <div className="uploads-list">
                            {uploadedItems.map((item) => (
                                <div 
                                    key={item.id} 
                                    className="upload-item"
                                    onClick={() => handleSummaryClick(item)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="item-icon">{item.icon}</div>
                                    <div className="item-info">
                                        <div className="item-title">{item.title}</div>
                                        <div className="item-meta">
                                            Summary • {item.date}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </aside>
                </div>

                {summary && (
                    <div className="summary-section">
                        <div className="summary-header">
                            <h3>📊 AI Summary</h3>
                            <span className="summary-meta">{summary.wordCount} words • {summary.estimatedReadTime}</span>
                        </div>
                        <div className="summary-content">
                            <h4>{summary.title}</h4>
                            <div className="key-points">
                                {summary.keyPoints.map((point, idx) => (
                                    <div key={idx} className="key-point">
                                        <span className="point-bullet">•</span>
                                        <span>{point}</span>
                                    </div>
                                ))}
                            </div>
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
                )}
            </div>
        </div>
    );
};

export default StudyUpload;