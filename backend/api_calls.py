
import librosa
from pytube import YouTube
from pydub import AudioSegment
import io
import os
import tempfile
from dotenv import load_dotenv
import google.generativeai as genai
from google.cloud import vision
from google.oauth2 import service_account
import PyPDF2
import yt_dlp
from pydub import AudioSegment
import time
import numpy as np
import flask
load_dotenv()

def get_file_info(file_bytes, content_type):
    """Detect file type and page count"""
    info = {
        'type': None,
        'pages': 1,  # Default for images
        'mime_type': content_type
    }
    
    if content_type == 'application/pdf':
        try:
            pdf_file = io.BytesIO(file_bytes)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            info['type'] = 'pdf'
            info['pages'] = len(pdf_reader.pages)
        except Exception as e:
            info['error'] = str(e)
    
    elif content_type.startswith('image/'):
        info['type'] = 'image'
        info['pages'] = 1
    
    return info

def make_flash_cards(texts, num_words, num_cards=10, batch_size=500):
    """
    Calls a Language Model API to process the extracted text.

    Args:
        texts (str): The text extracted from the image.
    Returns:
        str: The response from the Language Model API.
    """
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    num_batches = (num_words // batch_size) + 1
    summaries = ""
    for i in range(num_batches):
        words = " ".join(texts.split()[batch_size*i:batch_size*(i+1)])
        prompt = f"Generate {num_cards/num_batches} flash cards for the following text, keeping as much detail as possible while being concise without using external information: {words}. Please "
        model = genai.GenerativeModel('gemini-2.5-pro')
        response = model.generate_content(prompt)

        print(response.text)


        summaries += str(response.text) + "\n"
    
    return summaries
def call_google_cloud_vision_api(file_bytes, content_type):
    """
    Calls the Google Cloud Vision API to extract text from images.

    Args:
        file (file): The file to be processed. 
        content_type (str): The content type of the file.
        request.files['file']
    Returns:
        str: The extracted text from the image.
    """
    try:
        #file_bytes = file.read()
        #content_type = file.content_type
        
        # Get file info including page count
        credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        credentials = service_account.Credentials.from_service_account_file(credentials_path)
        client = vision.ImageAnnotatorClient(credentials=credentials)
        file_info = get_file_info(file_bytes, content_type)
        
        print(f"File type: {file_info['type']}, Pages: {file_info['pages']}")
        if file_info['type'] == 'pdf':
            # Check page limit
            if file_info['pages'] > 5:
                return 'PDF exceeds 5 page limit for inline processing'
            
            # Process PDF
            input_config = vision.InputConfig(
                content=file_bytes,
                mime_type='application/pdf'
            )
            
            feature = vision.Feature(
                type_=vision.Feature.Type.DOCUMENT_TEXT_DETECTION
            )
            
            # Specify exact pages to process
            request_vision = vision.AnnotateFileRequest(
                input_config=input_config,
                features=[feature],
                pages=list(range(1, file_info['pages'] + 1))
            )
            
            response = client.batch_annotate_files(requests=[request_vision])
            
            words = ""
            for idx, image_response in enumerate(response.responses[0].responses):
                if image_response.full_text_annotation:
                    words += image_response.full_text_annotation.text
            return words
        
        elif file_info['type'] == 'image':
            # Process image
            image = vision.Image(content=file_bytes)
            text_response = client.text_detection(image=image)
            text = text_response.text_annotations[0].description if text_response.text_annotations else ''
            
            return text
        
        else:
            return 'Unsupported file type'
    except Exception as e:
        return str(e)

def call_llm_api(texts, num_words, words_limit=100, batch_size=500):
    """
    Calls a Language Model API to process the extracted text.

    Args:
        texts (str): The text extracted from the image.
    Returns:
        str: The response from the Language Model API.
    """
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    num_batches = (num_words // batch_size) + 1
    summaries = ""
    for i in range(num_batches):
        words = " ".join(texts.split()[batch_size*i:batch_size*(i+1)])
        prompt = f"Provide a concise, detailed, in-depth summary of the following text in {words_limit/num_batches} words or less, adding no new information and only getting rid of irrelevant information:\n\n{words}"
        model = genai.GenerativeModel('gemini-2.5-pro')
        response = model.generate_content(prompt)

        print(response.text)


        summaries += str(response.text) + "\n"
    
    return summaries
def stream_audio(url):
    """
    Stream audio directly from YouTube URL using yt-dlp.
    Usage: /api/stream-audio?url=https://www.youtube.com/watch?v=...
    """
    try:
        # Set FFmpeg path
        os.environ['PATH'] = r'C:\Users\Syuen\OneDrive\Desktop\CS Girlies\ffmpeg\ffmpeg-8.0-essentials_build\bin;' + os.environ['PATH']
        
        youtube_url = url
        print(f"Processing: {youtube_url}")
        
        # Create temporary directory for download
        temp_dir = tempfile.mkdtemp()
        output_template = os.path.join(temp_dir, 'audio.%(ext)s')
        
        try:
            # Configure yt-dlp options
            ydl_opts = {
                'format': 'bestaudio/best',
                'outtmpl': output_template,
                'quiet': False,
                'no_warnings': False,
                'extract_flat': False,
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': '192',
                }],
                'ffmpeg_location': r'C:\Users\Syuen\OneDrive\Desktop\CS Girlies\ffmpeg\ffmpeg-8.0-essentials_build\bin',
            }
            
            # Download and convert audio
            print("Downloading and converting to MP3...")
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(youtube_url, download=True)
                print(f"Title: {info.get('title', 'Unknown')}")
            
            # Find the downloaded MP3 file
            mp3_file = os.path.join(temp_dir, 'audio.mp3')
            
            # Wait a moment to ensure file is fully written
            time.sleep(0.5)
            
            if not os.path.exists(mp3_file):
                raise FileNotFoundError(f"MP3 file not found at {mp3_file}")
            
            # Read the MP3 bytes
            print("Reading MP3 file...")
            with open(mp3_file, 'rb') as f:
                mp3_bytes = f.read()
            
            print(f"Success! Streaming {len(mp3_bytes)} bytes ({len(mp3_bytes)/(1024*1024):.2f} MB)")
            
            return mp3_bytes
              
        finally:
            # Clean up temp directory and all files
            try:
                for file in os.listdir(temp_dir):
                    file_path = os.path.join(temp_dir, file)
                    os.remove(file_path)
                os.rmdir(temp_dir)
                print("Temp files cleaned up")
            except Exception as cleanup_error:
                print(f"Cleanup warning: {cleanup_error}")
        
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return None
              

def wav_beat_tracking_from_bytes(mp3_bytes):
    """
    Performs beat tracking on MP3 audio bytes.

    Args:
        mp3_bytes (bytes): The MP3 audio data as bytes.
        
    Returns:
        tuple: A tuple containing the estimated tempo (BPM) and an array of beat times (in seconds).
    """
    
    # Create a BytesIO object from the MP3 bytes
    mp3_buffer = io.BytesIO(mp3_bytes)
    
    # Load MP3 from buffer using pydub
    audio = AudioSegment.from_file(mp3_buffer, format="mp3")
    
    # Export to WAV format in memory
    wav_buffer = io.BytesIO()
    audio.export(wav_buffer, format="wav")
    wav_buffer.seek(0)
    
    # Load the audio data using librosa
    y, sr = librosa.load(wav_buffer, sr=None)
    
    # Run the beat tracker
    tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
    
    # Convert tempo to float (it comes as numpy array with single value)
    tempo = float(tempo) if isinstance(tempo, np.ndarray) else tempo
    
    # Convert frame indices to time (seconds)
    beat_times = librosa.frames_to_time(beat_frames, sr=sr)
    
    return tempo, beat_times



def beat_adjustment(tempo, beat_times, target_tempo=120.0):
    """
    Adjusts beat times to match a target tempo.

    Args:
        tempo (float): The original estimated tempo (BPM).
        beat_times (np.ndarray): Array of original beat times (in seconds).
        target_tempo (float): The desired target tempo (BPM).
    Returns:
        tuple: (adjusted_beat_times, speed_factor)
    """
    # Ensure tempo is a float
    tempo = float(tempo) if isinstance(tempo, np.ndarray) else tempo
    
    # Calculate the absolute differences between target tempo and possible tempo options
    diff_original = abs(target_tempo - tempo)
    diff_half = abs(target_tempo - (tempo / 2))
    diff_double = abs(target_tempo - (tempo * 2))
    
    # Find which option is closest to the target tempo
    min_diff = min(diff_original, diff_half, diff_double)
    
    if min_diff == diff_original:
        # Case 1: Target is closest to original tempo
        # speed_factor < 1 means slow down, > 1 means speed up
        speed_factor = target_tempo / tempo
        # When slowing down (speed_factor < 1), beat times get stretched (multiplied by > 1)
        # When speeding up (speed_factor > 1), beat times get compressed (multiplied by < 1)
        adjusted_beat_times = beat_times * (tempo / target_tempo)
    elif min_diff == diff_half:
        # Case 2: Target is closest to half tempo (remove every other beat)
        effective_tempo = tempo / 2
        speed_factor = target_tempo / effective_tempo
        adjusted_beat_times = beat_times[::2] * (effective_tempo / target_tempo)
    else:
        # Case 3: Target is closest to double tempo (insert beats between existing beats)
        effective_tempo = tempo * 2
        speed_factor = target_tempo / effective_tempo
        # Create new beat times by inserting midpoints between consecutive beats
        new_beats = []
        for i in range(len(beat_times) - 1):
            new_beats.append(beat_times[i])
            # Insert midpoint between current and next beat
            new_beats.append((beat_times[i] + beat_times[i + 1]) / 2)
        new_beats.append(beat_times[-1])  # Add the last beat
        adjusted_beat_times = np.array(new_beats) * (effective_tempo / target_tempo)
            
    return adjusted_beat_times, speed_factor


def generate_beat_audio(beat_times, output_path, duration=30.0, sample_rate=44100):
    """
    Generate an audio file with click sounds at specified beat times.
    
    Args:
        beat_times (np.ndarray): Array of beat times in seconds
        output_path (str): Path to save the output audio file
        duration (float): Total duration of the output audio in seconds
        sample_rate (int): Sample rate of the output audio
        
    Returns:
        str: Path to the generated audio file
    """
    from pydub import AudioSegment
    from pydub.generators import Sine
    import numpy as np
    
    # Create a silent audio segment
    audio = AudioSegment.silent(duration=duration * 1000)  # pydub works in milliseconds
    
    # Generate a louder click sound (5ms of 1000Hz sine wave at 0dBFS)
    click_duration = 5  # milliseconds
    click = Sine(1000).to_audio_segment(duration=click_duration).apply_gain(0)  # 0dBFS (maximum volume)
    
    # Add a short fade to the click to prevent clicks in the audio
    click = click.fade_out(1).fade_in(1)
    
    # Add clicks at each beat time
    for beat_time in beat_times:
        if beat_time <= duration:
            # Add click at the beat time (converted to milliseconds)
            position = int(beat_time * 1000)
            audio = audio.overlay(click, position=position)
    
    # Add a short fade in/out to prevent clicks at start/end
    audio = audio.fade_in(10).fade_out(10)
    
    # Export as WAV with higher volume (normalize to -1dBFS)
    audio = audio.normalize(headroom=1)
    audio.export(output_path, format='wav', parameters=["-ac", "2"])  # Force stereo output
    
    return output_path

def test_google_cloud_vision():
    """Test Google Cloud Vision API with image and PDF files"""
    print("\n" + "="*60)
    print("TESTING GOOGLE CLOUD VISION API")
    print("="*60)
    
    # Test with an image file
    print("\n--- Testing with Image ---")
    image_path = input("Enter path to test image (or press Enter to skip): ").strip()
    
    if image_path and os.path.exists(image_path):
        try:
            with open(image_path, 'rb') as f:
                image_bytes = f.read()
            
            # Detect content type
            if image_path.lower().endswith('.png'):
                content_type = 'image/png'
            elif image_path.lower().endswith('.jpg') or image_path.lower().endswith('.jpeg'):
                content_type = 'image/jpeg'
            else:
                content_type = 'image/png'
            
            result = call_google_cloud_vision_api(image_bytes, content_type)
            print(f"\nExtracted Text from Image:\n{result[:500]}...")  # First 500 chars
            print(f"\nTotal characters: {len(result)}")
            
        except Exception as e:
            print(f"Error processing image: {e}")
    
    # Test with a PDF file
    print("\n--- Testing with PDF ---")
    pdf_path = input("Enter path to test PDF (or press Enter to skip): ").strip()
    
    if pdf_path and os.path.exists(pdf_path):
        try:
            with open(pdf_path, 'rb') as f:
                pdf_bytes = f.read()
            
            result = call_google_cloud_vision_api(pdf_bytes, 'application/pdf')
            print(f"\nExtracted Text from PDF:\n{result[:500]}...")  # First 500 chars
            print(f"\nTotal characters: {len(result)}")
            
        except Exception as e:
            print(f"Error processing PDF: {e}")


def test_llm_summarization():
    """Test LLM API for text summarization"""
    print("\n" + "="*60)
    print("TESTING LLM SUMMARIZATION")
    print("="*60)
    
    # Sample text for testing
    sample_text = """
    Artificial intelligence (AI) is intelligence demonstrated by machines, in contrast to the 
    natural intelligence displayed by humans and animals. Leading AI textbooks define the field 
    as the study of "intelligent agents": any device that perceives its environment and takes 
    actions that maximize its chance of successfully achieving its goals. Colloquially, the term 
    "artificial intelligence" is often used to describe machines (or computers) that mimic 
    "cognitive" functions that humans associate with the human mind, such as "learning" and 
    "problem solving". As machines become increasingly capable, tasks considered to require 
    "intelligence" are often removed from the definition of AI, a phenomenon known as the AI effect. 
    A quip in Tesler's Theorem says "AI is whatever hasn't been done yet." For instance, optical 
    character recognition is frequently excluded from things considered to be AI, having become a 
    routine technology.
    """
    
    print("\nOriginal text:")
    print(sample_text)
    print(f"\nWord count: {len(sample_text.split())}")
    
    # Test summarization
    try:
        words_limit = int(input("\nEnter desired summary length in words (default 50): ") or "50")
        
        print("\nGenerating summary...")
        summary = call_llm_api(sample_text, len(sample_text.split()), words_limit=words_limit)
        
        print("\n--- Generated Summary ---")
        print(summary)
        print(f"\nSummary word count: {len(summary.split())}")
        
    except Exception as e:
        print(f"Error during summarization: {e}")


def test_audio_streaming():
    """Test YouTube audio streaming"""
    print("\n" + "="*60)
    print("TESTING YOUTUBE AUDIO STREAMING")
    print("="*60)
    
    youtube_url = input("\nEnter YouTube URL to stream (or press Enter to skip): ").strip()
    
    if youtube_url:
        try:
            print("\nStreaming audio from YouTube...")
            mp3_bytes = stream_audio(youtube_url)
            
            if mp3_bytes:
                print(f"\nSuccessfully downloaded audio!")
                print(f"Audio size: {len(mp3_bytes) / (1024*1024):.2f} MB")
                
                # Optionally save to file
                save = input("\nSave to file? (y/n): ").strip().lower()
                if save == 'y':
                    output_path = input("Enter output filename (e.g., audio.mp3): ").strip()
                    with open(output_path, 'wb') as f:
                        f.write(mp3_bytes)
                    print(f"Saved to {output_path}")
                
                return mp3_bytes  # Return for beat tracking test
            
        except Exception as e:
            print(f"Error streaming audio: {e}")
    
    return None


def test_beat_tracking(mp3_bytes=None):
    """Test beat tracking on audio"""
    print("\n" + "="*60)
    print("TESTING BEAT TRACKING")
    print("="*60)
    os.environ['PATH'] = r'C:\Users\Syuen\OneDrive\Desktop\CS Girlies\ffmpeg\ffmpeg-8.0-essentials_build\bin;' + os.environ['PATH']
    if mp3_bytes is None:
        # Load from file
        audio_path = input("\nEnter path to MP3 file (or press Enter to skip): ").strip()
        
        if audio_path and os.path.exists(audio_path):
            try:
                with open(audio_path, 'rb') as f:
                    mp3_bytes = f.read()
            except Exception as e:
                print(f"Error loading audio file: {e}")
                return
        else:
            print("No audio file provided, skipping beat tracking test.")
            return
    
    try:
        print("\nAnalyzing beats...")
        tempo, beat_times = wav_beat_tracking_from_bytes(mp3_bytes)
        
        print(f"\n--- Beat Tracking Results ---")
        print(f"Estimated Tempo: {tempo:.2f} BPM")
        print(f"Number of beats detected: {len(beat_times)}")
        print(f"First 10 beat times (seconds): {beat_times[:10].tolist()}")
        print(f"Duration: {beat_times[-1]:.2f} seconds" if len(beat_times) > 0 else "No beats detected")
        
        # Test beat adjustment
        target_tempo = float(input("\nEnter target tempo for adjustment (default 120): ") or "120")
        
        print(f"\nAdjusting beats to target tempo: {target_tempo} BPM...")
        adjusted_beats = beat_adjustment(tempo, beat_times, target_tempo)
        
        print(f"\n--- Adjusted Beat Times ---")
        print(f"Number of adjusted beats: {len(adjusted_beats)}")
        print(f"First 10 adjusted beat times (seconds): {adjusted_beats[:10].tolist()}")
        
        # Calculate time between beats
        if len(adjusted_beats) > 1:
            beat_intervals = np.diff(adjusted_beats)
            avg_interval = np.mean(beat_intervals)
            calculated_bpm = 60.0 / avg_interval
            print(f"Average beat interval: {avg_interval:.3f} seconds")
            print(f"Calculated BPM from adjusted beats: {calculated_bpm:.2f}")
        
    except Exception as e:
        print(f"Error during beat tracking: {e}")
        import traceback
        traceback.print_exc()


def test_complete_workflow():
    """Test complete workflow: Image -> Text -> Summary"""
    print("\n" + "="*60)
    print("TESTING COMPLETE WORKFLOW: IMAGE/PDF -> TEXT -> SUMMARY")
    print("="*60)
    
    file_path = input("\nEnter path to image or PDF file: ").strip()
    
    if not file_path or not os.path.exists(file_path):
        print("Invalid file path, skipping workflow test.")
        return
    
    try:
        # Step 1: Extract text
        print("\n[Step 1] Extracting text from document...")
        with open(file_path, 'rb') as f:
            file_bytes = f.read()
        
        if file_path.lower().endswith('.pdf'):
            content_type = 'application/pdf'
        elif file_path.lower().endswith('.png'):
            content_type = 'image/png'
        elif file_path.lower().endswith(('.jpg', '.jpeg')):
            content_type = 'image/jpeg'
        else:
            content_type = 'image/png'
        
        extracted_text = call_google_cloud_vision_api(file_bytes, content_type)
        print(f"✓ Extracted {len(extracted_text)} characters")
        print(f"\nFirst 200 characters:\n{extracted_text[:200]}...")
        
        # Step 2: Summarize text
        if len(extracted_text) > 50:
            print("\n[Step 2] Generating summary...")
            words_limit = int(input("Enter desired summary length in words (default 100): ") or "100")
            
            summary = call_llm_api(extracted_text, len(extracted_text.split()), words_limit=words_limit)
            
            print("\n--- Final Summary ---")
            print(summary)
        else:
            print("\nText too short for summarization.")
        
    except Exception as e:
        print(f"Error in workflow: {e}")


def main():
    """Main function to test beat detection with original and adjusted audio"""
    import os
    from pydub import AudioSegment
    from app import change_audio_speed_pydub
    
    # Set FFmpeg path
    os.environ['PATH'] = r'C:\Users\Syuen\GROUP\rhythm-notes\CS Girlies\ffmpeg\ffmpeg-8.0-essentials_build\bin;' + os.environ['PATH']
    
    # Get input file path
    audio_path = input("Enter path to MP3 file: ").strip()
    if not os.path.exists(audio_path):
        print(f"Error: File not found: {audio_path}")
        return
    
    try:
        # Load the MP3 file
        print(f"Loading {audio_path}...")
        with open(audio_path, 'rb') as f:
            mp3_bytes = f.read()
        
        # Detect original beats
        print("Detecting original beats...")
        original_tempo, original_beats = wav_beat_tracking_from_bytes(mp3_bytes)
        
        # Get target tempo from user
        target_tempo = float(input(f"\nOriginal Tempo: {original_tempo:.1f} BPM\nEnter target tempo (or press Enter to keep original): ") or original_tempo)
        
        # Calculate speed factor (inverse of tempo ratio to get the correct speed change)
        speed_factor = original_tempo / target_tempo
        
        # Adjust beats to target tempo
        print(f"\nAdjusting beats to {target_tempo} BPM (speed factor: {speed_factor:.2f}x)...")
        adjusted_beats, adjustment_factor = beat_adjustment(original_tempo, original_beats, target_tempo)
        
        # Generate verification audio for both
        print("\nGenerating verification audio files...")
        base_name = os.path.splitext(os.path.basename(audio_path))[0]
        output_dir = os.path.dirname(os.path.abspath(audio_path)) or '.'
        
        # Original beats
        orig_output = os.path.join(output_dir, f"{base_name}_original_beats.wav")
        generate_beat_audio(original_beats, orig_output, duration=30.0)
        
        # Adjusted beats
        adj_output = os.path.join(output_dir, f"{base_name}_adjusted_{target_tempo:.0f}bpm.wav")
        generate_beat_audio(adjusted_beats, adj_output, duration=30.0)
        
        # Generate adjusted audio file
        print("\nGenerating adjusted audio file...")
        adjusted_audio_bytes = change_audio_speed_pydub(mp3_bytes, speed_factor)
        adjusted_audio_path = os.path.join(output_dir, f"{base_name}_adjusted_{target_tempo:.0f}bpm.mp3")
        with open(adjusted_audio_path, 'wb') as f:
            f.write(adjusted_audio_bytes)
        
        print(f"\nFiles created:")
        print(f"- Original beats: {os.path.abspath(orig_output)}")
        print(f"- Adjusted beats: {os.path.abspath(adj_output)}")
        print(f"- Adjusted audio: {os.path.abspath(adjusted_audio_path)}")
        print("\nListen to the files to compare the beat detection and adjustment.")
        
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()


"""
Main test menu

print("\n" + "="*60)
print("DOCUMENT PROCESSING & AUDIO ANALYSIS TEST SUITE")
print("="*60)

while True:
    print("\n\nSelect test to run:")
    print("1. Test Google Cloud Vision API (Image/PDF text extraction)")
    print("2. Test LLM Summarization")
    print("3. Test YouTube Audio Streaming")
    print("4. Test Beat Tracking")
    print("5. Test Complete Workflow (Document -> Text -> Summary)")
    print("6. Run All Tests")
    print("0. Exit")

    choice = input("\nEnter choice (0-6): ").strip()

    if choice == '1':
        test_google_cloud_vision()
    elif choice == '2':
        test_llm_summarization()
    elif choice == '3':
        mp3_bytes = test_audio_streaming()
        if mp3_bytes:
            use_for_beats = input("\nUse this audio for beat tracking? (y/n): ").strip().lower()
            if use_for_beats == 'y':
    print("="*60)
    
    while True:
        print("\n\nSelect test to run:")
        print("1. Test Google Cloud Vision API (Image/PDF text extraction)")
        print("2. Test LLM Summarization")
        print("3. Test YouTube Audio Streaming")
        print("4. Test Beat Tracking")
        print("5. Test Complete Workflow (Document -> Text -> Summary)")
        print("6. Run All Tests")
        print("0. Exit")
        
        choice = input("\nEnter choice (0-6): ").strip()
        
        if choice == '1':
            test_google_cloud_vision()
        elif choice == '2':
            test_llm_summarization()
        elif choice == '3':
            mp3_bytes = test_audio_streaming()
            if mp3_bytes:
                use_for_beats = input("\nUse this audio for beat tracking? (y/n): ").strip().lower()
                if use_for_beats == 'y':
                    test_beat_tracking(mp3_bytes)
        elif choice == '4':
            test_beat_tracking()
        elif choice == '5':
            test_complete_workflow()
        elif choice == '6':
            print("\n\nRUNNING ALL TESTS...")
            test_google_cloud_vision()
            test_llm_summarization()
            mp3_bytes = test_audio_streaming()
            if mp3_bytes:
                test_beat_tracking(mp3_bytes)
            test_complete_workflow()
        elif choice == '0':
            print("\nExiting test suite. Goodbye!")
            break
        else:
            print("\nInvalid choice. Please try again.")
    """

if __name__ == "__main__":
    # Check environment setup
    print("Checking environment setup...")
    
    if not os.getenv("GEMINI_API_KEY"):
        print("⚠️  Warning: GEMINI_API_KEY not found in environment")
    else:
        print("✓ GEMINI_API_KEY found")
    
    if not os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
        print("⚠️  Warning: GOOGLE_APPLICATION_CREDENTIALS not set")
    else:
        print("✓ GOOGLE_APPLICATION_CREDENTIALS set")
    
    # Run main test menu
    main()