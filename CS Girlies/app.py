from flask import Flask, request, jsonify, send_file, make_response
from werkzeug.utils import secure_filename
import os
import io
import tempfile
from dotenv import load_dotenv
import logging
import numpy as np
from pydub import AudioSegment
from api_calls import (
    call_google_cloud_vision_api,
    call_llm_api,
    stream_audio,
    wav_beat_tracking_from_bytes,
    beat_adjustment
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = tempfile.mkdtemp()

# Helper function to handle errors
def handle_error(message, status_code=400):
    return jsonify({'error': message}), status_code

@app.route('/api/extract-text', methods=['POST'])
def extract_text():
    """
    Extract text from uploaded file (image or PDF)
    ---
    parameters:
      - name: file
        in: formData
        type: file
        required: true
        description: The file to process (image or PDF)
    responses:
      200:
        description: Extracted text
      400:
        description: Invalid file or error processing
    """
    if 'file' not in request.files:
        return handle_error('No file provided')
    
    file = request.files['file']
    if file.filename == '':
        return handle_error('No selected file')
    
    try:
        file_bytes = file.read()
        content_type = file.content_type
        
        # Process the file
        extracted_text = call_google_cloud_vision_api(file_bytes, content_type)
        
        return jsonify({
            'status': 'success',
            'text': extracted_text,
            'characters': len(extracted_text)
        })
    except Exception as e:
        logger.error(f"Error extracting text: {str(e)}")
        return handle_error(f'Error processing file: {str(e)}', 500)

@app.route('/api/summarize', methods=['POST'])
def summarize():
    """
    Generate a summary of the provided text
    ---
    parameters:
      - name: text
        in: formData
        type: string
        required: true
        description: The text to summarize
      - name: words_limit
        in: formData
        type: integer
        required: false
        default: 100
        description: Maximum number of words in the summary
    responses:
      200:
        description: Generated summary
      400:
        description: Invalid input
    """
    text = request.form.get('text')
    if not text:
        return handle_error('No text provided')
    
    try:
        words_limit = int(request.form.get('words_limit', 100))
        num_words = len(text.split())
        
        # Generate summary
        summary = call_llm_api(text, num_words, words_limit=words_limit)
        
        return jsonify({
            'status': 'success',
            'summary': summary,
            'original_length': num_words,
            'summary_length': len(summary.split())
        })
    except Exception as e:
        logger.error(f"Error generating summary: {str(e)}")
        return handle_error(f'Error generating summary: {str(e)}', 500)

@app.route('/api/audio/stream', methods=['GET'])
def get_audio():
    """
    Stream audio from YouTube URL
    ---
    parameters:
      - name: url
        in: query
        type: string
        required: true
        description: YouTube URL to stream audio from
    responses:
      200:
        description: Audio file
        content:
          audio/mpeg:
            schema:
              type: string
              format: binary
      400:
        description: Invalid URL or error processing
    """
    url = request.args.get('url')
    if not url:
        return handle_error('No URL provided')
    
    try:
        mp3_bytes = stream_audio(url)
        if not mp3_bytes:
            return handle_error('Failed to process audio', 500)
        
        response = make_response(mp3_bytes)
        response.headers['Content-Type'] = 'audio/mpeg'
        response.headers['Content-Disposition'] = 'attachment; filename=audio.mp3'
        return response
    except Exception as e:
        logger.error(f"Error streaming audio: {str(e)}")
        return handle_error(f'Error processing audio: {str(e)}', 500)

@app.route('/api/audio/analyze', methods=['POST'])
def analyze_audio():
    """
    Analyze audio beats and tempo
    ---
    parameters:
      - name: file
        in: formData
        type: file
        required: true
        description: Audio file to analyze (MP3)
      - name: target_tempo
        in: formData
        type: number
        required: false
        default: 120.0
        description: Target tempo for beat adjustment
    responses:
      200:
        description: Analysis results
      400:
        description: Invalid file or error processing
    """
    if 'file' not in request.files:
        return handle_error('No file provided')
    
    file = request.files['file']
    if file.filename == '':
        return handle_error('No selected file')
    
    try:
        target_tempo = float(request.form.get('target_tempo', 120.0))
        mp3_bytes = file.read()
        
        # Analyze beats
        tempo, beat_times = wav_beat_tracking_from_bytes(mp3_bytes)
        
        # Adjust beats to target tempo
        adjusted_beats = beat_adjustment(tempo, beat_times, target_tempo)
        
        # Calculate beat intervals
        beat_intervals = []
        if len(adjusted_beats) > 1:
            beat_intervals = np.diff(adjusted_beats).tolist()
        
        return jsonify({
            'status': 'success',
            'original_tempo': float(tempo),
            'target_tempo': target_tempo,
            'beat_count': len(adjusted_beats),
            'beat_times': adjusted_beats.tolist(),
            'beat_intervals': beat_intervals,
            'duration': float(adjusted_beats[-1]) if len(adjusted_beats) > 0 else 0
        })
        
    except Exception as e:
        logger.error(f"Error analyzing audio: {str(e)}")
        return handle_error(f'Error analyzing audio: {str(e)}', 500)

@app.route('/api/process-document', methods=['POST'])
def process_document():
    """
    Complete document processing workflow: Extract text and generate summary
    ---
    parameters:
      - name: file
        in: formData
        type: file
        required: true
        description: Document to process (image or PDF)
      - name: words_limit
        in: formData
        type: integer
        required: false
        default: 100
        description: Maximum number of words in the summary
    responses:
      200:
        description: Extracted text and summary
      400:
        description: Invalid file or error processing
    """
    if 'file' not in request.files:
        return handle_error('No file provided')
    
    file = request.files['file']
    if file.filename == '':
        return handle_error('No selected file')
    
    try:
        words_limit = int(request.form.get('words_limit', 100))
        file_bytes = file.read()
        content_type = file.content_type
        
        # Extract text
        extracted_text = call_google_cloud_vision_api(file_bytes, content_type)
        
        # Generate summary if text is long enough
        summary = None
        if len(extracted_text.split()) > 50:
            summary = call_llm_api(extracted_text, len(extracted_text.split()), words_limit=words_limit)
        
        return jsonify({
            'status': 'success',
            'text': extracted_text,
            'summary': summary,
            'characters': len(extracted_text),
            'words': len(extracted_text.split())
        })
        
    except Exception as e:
        logger.error(f"Error processing document: {str(e)}")
        return handle_error(f'Error processing document: {str(e)}', 500)

def change_audio_speed_pydub(mp3_bytes, speed_factor=1.0):
    """
    Change audio speed using pydub.
    
    Args:
        mp3_bytes (bytes): MP3 audio data
        speed_factor (float): Speed multiplier (0.5 = half speed, 2.0 = double speed)
    
    Returns:
        bytes: Modified MP3 audio data
    """
    # Load audio from bytes
    audio = AudioSegment.from_file(io.BytesIO(mp3_bytes), format="mp3")
    
    # Method 1: Change speed WITHOUT pitch change (time stretching)
    # This maintains the original pitch
    sound_with_altered_frame_rate = audio._spawn(
        audio.raw_data, 
        overrides={"frame_rate": int(audio.frame_rate * speed_factor)}
    )
    
    # Convert back to standard frame rate
    modified_audio = sound_with_altered_frame_rate.set_frame_rate(audio.frame_rate)
    
    # Export to bytes
    output_buffer = io.BytesIO()
    modified_audio.export(output_buffer, format='mp3', bitrate='192k')
    output_buffer.seek(0)
    
    return output_buffer.read()

@app.route('/api/audio/adjust-speed', methods=['POST'])
def adjust_audio_speed():
    """
    Endpoint to adjust audio speed
    
    Request format:
    - Form data with 'audio' (MP3 file) and 'speed' (float, optional, default=1.0)
    
    Returns:
        Modified audio file with adjusted speed
    """
    try:
        # Check if the post request has the file part
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
            
        audio_file = request.files['audio']
        speed_factor = float(request.form.get('speed', 1.0))
        
        # Validate speed factor
        if not 0.5 <= speed_factor <= 2.0:
            return jsonify({'error': 'Speed factor must be between 0.5 and 2.0'}), 400
            
        # Read the audio file
        audio_bytes = audio_file.read()
        
        # Process the audio
        modified_audio = change_audio_speed_pydub(audio_bytes, speed_factor)
        
        # Create response with the modified audio
        response = make_response(modified_audio)
        response.headers['Content-Type'] = 'audio/mp3'
        response.headers['Content-Disposition'] = 'attachment; filename=modified_audio.mp3'
        
        return response
        
    except Exception as e:
        logger.error(f"Error processing audio: {str(e)}")
        return jsonify({'error': f'Error processing audio: {str(e)}'}), 500



@app.route('/')
def index():
    """API documentation"""
    return '''
    <h1>Document and Audio Processing API</h1>
    <h2>Endpoints:</h2>
    <ul>
        <li><strong>POST /api/extract-text</strong> - Extract text from image/PDF</li>
        <li><strong>POST /api/summarize</strong> - Generate text summary</li>
        <li><strong>GET /api/audio/stream?url=YOUTUBE_URL</strong> - Stream audio from YouTube</li>
        <li><strong>POST /api/audio/analyze</strong> - Analyze audio beats and tempo</li>
        <li><strong>POST /api/process-document</strong> - Complete document processing (extract + summarize)</li>
    </ul>
    '''

if __name__ == '__main__':
    # Check environment setup
    if not os.getenv("GEMINI_API_KEY"):
        logger.warning("GEMINI_API_KEY not found in environment")
    
    if not os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
        logger.warning("GOOGLE_APPLICATION_CREDENTIALS not set")
    
    # Run the app
    app.run(debug=True, host='0.0.0.0', port=5000)
