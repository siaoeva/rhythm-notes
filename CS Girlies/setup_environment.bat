@echo off
echo Setting up environment...

:: Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Python is not installed or not in PATH. Please install Python first.
    pause
    exit /b 1
)

:: Create necessary directories
if not exist "%USERPROFILE%\bin" mkdir "%USERPROFILE%\bin"

:: Create and activate virtual environment
echo Creating Python virtual environment...
python -m venv venv
call venv\Scripts\activate.bat

:: Download and extract Poppler
echo Downloading Poppler...
curl -L -o poppler.zip https://github.com/oschwartz10612/poppler-windows/releases/download/v23.11.0-0/Release-23.11.0-0.zip
if %ERRORLEVEL% NEQ 0 (
    echo Failed to download Poppler.
    pause
    exit /b 1
)

echo Extracting Poppler...
powershell -command "Expand-Archive -Path poppler.zip -DestinationPath \"%USERPROFILE%\poppler\" -Force"
if %ERRORLEVEL% NEQ 0 (
    echo Failed to extract Poppler.
    pause
    exit /b 1
)

:: Download and extract FFmpeg
echo Downloading FFmpeg...
curl -L -o ffmpeg.zip https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip
if %ERRORLEVEL% NEQ 0 (
    echo Failed to download FFmpeg.
    pause
    exit /b 1
)

echo Extracting FFmpeg...
powershell -command "Expand-Archive -Path ffmpeg.zip -DestinationPath \"%USERPROFILE%\ffmpeg_temp\" -Force"
if %ERRORLEVEL% NEQ 0 (
    echo Failed to extract FFmpeg.
    pause
    exit /b 1
)

for /d %%i in ("%USERPROFILE%\ffmpeg_temp\*") do (
    if not exist "%USERPROFILE%\ffmpeg" (
        move "%%i" "%USERPROFILE%\ffmpeg"
    ) else (
        xcopy /E /I "%%i\*" "%USERPROFILE%\ffmpeg\"
    )
)

:: Add to PATH
echo Adding to PATH...
setx PATH "%PATH%;%USERPROFILE%\poppler\Library\bin;%USERPROFILE%\ffmpeg\bin" /M
if %ERRORLEVEL% NEQ 0 (
    echo Failed to update system PATH. You may need to run as Administrator.
    echo Alternatively, add these paths to your PATH manually:
    echo %USERPROFILE%\poppler\Library\bin
    echo %USERPROFILE%\ffmpeg\bin
)

:: Install Python packages
echo Installing Python packages...
pip install --upgrade pip
pip install pdf2image yt-dlp openai python-dotenv
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install Python packages.
    pause
    exit /b 1
)

:: Clean up
del /q poppler.zip ffmpeg.zip >nul 2>&1
rmdir /s /q "%USERPROFILE%\ffmpeg_temp" >nul 2>&1

echo.
echo Setup complete!
echo 1. The virtual environment has been created and activated.
echo 2. To activate it in the future, run: venv\Scripts\activate
echo 3. Please restart your terminal and IDE for PATH changes to take effect.
echo.
pause