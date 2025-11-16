npm install
npm install react-router-dom


# Smart Note Summarizer & Organizer - Frontend README

Welcome to the **Smart Note Summarizer & Organizer** project. This application leverages AI to help students organize, summarize, and interact with their study materials. The project includes several features to assist with note-taking, studying, and even gamifying the learning process. This README outlines the frontend architecture, features, and setup instructions for the application.
---

## Overview

The **Smart Note Summarizer & Organizer** helps students by taking messy lecture notes, videos, and images, and using AI to organize, summarize, and highlight the key points. It also includes fun gamified features such as flashcards, rhythm typing games, and a platforming game, all designed to make studying more interactive and engaging.

---

## Features

* **Summarization and Organization**: Automatically organizes and summarizes lecture notes, screenshots, and videos.
* **Flashcards Generation**: Converts summarized content into flashcards for better memorization.
* **Collaboration**: Multiple students can collaborate on the same notes.
* **Rhythm Game**: Play a typing rhythm game based on the BPM of uploaded songs.
* **Gamified Elements**: Includes Gacha rewards, skins, and custom music tracks to keep students engaged.
* **BPM Sync**: Upload songs, detect their BPM, and adjust the game mechanics accordingly.
* **Interactive Games**: Typing speed games and platforming games for speed and accuracy practice.
* **Multi-Language Support**: Supports various study fields including Vocab, Spelling, Psychology, Business, Humanities, and more.

---

## Frontend Structure

The frontend is built using modern web technologies and provides a seamless user experience for interaction with the app's various features.

### Main Pages and Components:

1. **Start/Landing Page**:

   * Introduction to the app and its features.
   * Prompts the user to sign up or log in.

2. **Authentication Pages**:

   * **Login Page**: Allows users to log into their accounts.
   * **Sign Up Page**: New users can create an account.

3. **Home Page**:

   * Central hub linking to other features of the app.
   * Back button navigation to return to this page.

4. **Upload Page**:

   * Allows users to upload study materials such as PDFs, text files, and images.
   * Reuse text from previous uploads.

5. **Summarization Settings Page**:

   * Users can set the word limit for the summarization of their study materials.

6. **Music Page**:

   * Allows users to input a YouTube song URL.
   * Plays the song across the website with pause/stop functionality.

7. **Rhythm Game Page**:

   * Plays the mp3 of the song.
   * Displays text in a typable format (similar to **Typeracer**).
   * Rhythm game mechanics based on the song’s BPM.
   * Scoring and leaderboard functionality.

8. **User Profile Page**:

   * Displays user details and progress.
   * Allows users to update their profile information.

---

## Pages and Functionality

### 1. **Start/Landing Page**

* **Purpose**: Provide an introduction to the app and explain the features.
* **Components**:

  * A welcome section with an overview of the app.
  * Call-to-action buttons for signing up or logging in.
  * Navigation links to features like study material upload and games.

### 2. **Authentication Pages**

* **Purpose**: Provide login and sign-up functionalities.
* **Components**:

  * **Login**: Allows users to authenticate with existing credentials.
  * **Sign Up**: Allows new users to register and create an account.
  * Form validation and error handling.

### 3. **Home Page**

* **Purpose**: The central navigation hub.
* **Components**:

  * Links to all core app functionalities (uploading study materials, rhythm game, etc.).
  * User profile link.
  * **Back Button**: Navigates back to this page from any feature.

### 4. **Upload Page**

* **Purpose**: Upload study materials (text, images, PDFs, etc.).
* **Components**:

  * **File Upload**: Users can drag and drop or browse files to upload.
  * Option to extract text from images and PDFs.
  * Reuse previously uploaded text.
  * Display of previous uploads for easy access.

### 5. **Summarization Settings Page**

* **Purpose**: Set summarization parameters (e.g., word limit).
* **Components**:

  * Form to set word count limit for summarization.
  * Options to select which notes to summarize or keep intact.

### 6. **Music Page**

* **Purpose**: Upload songs and play them across the app.
* **Components**:

  * **YouTube URL Input**: Users input the URL of a song.
  * Music player controls (Play, Pause, Stop).
  * Display of BPM detected from the song.

### 7. **Rhythm Game Page**

* **Purpose**: Allows users to play a typing rhythm game.
* **Components**:

  * Song playback with BPM sync.
  * Typing area with text to type, moving along with the rhythm.
  * **Score**: Tracks typing accuracy and speed.
  * **Leaderboard**: Displays high scores of users.

### 8. **User Profile Page**

* **Purpose**: Display user details and progress.
* **Components**:

  * User details (name, email, etc.).
  * Progress indicators (flashcards, games, uploads).
  * Option to edit profile information.

---

## Technologies Used

* **React**: Core frontend framework.
* **Redux**: State management for handling user data, authentication, and game state.
* **Firebase**: For authentication and storing user data.
* **Tailwind CSS**: For styling the application.
* **Axios**: For making HTTP requests to the backend API.
* **HTML5 Audio API**: To handle music playback and synchronize the rhythm game.
* **YouTube API**: To embed and detect BPM of songs from YouTube URLs.

---

## Setup and Installation

### Prerequisites

Make sure you have the following installed on your system:

* Node.js (>= 14.x)
* npm (>= 6.x)

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/siaoeva/rhythm-notes.git
   cd rhythm-notes/frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   npm install react-router-dom
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Visit `http://localhost:3000` in your browser to view the app.

---

Thank you for checking out the **Smart Note Summarizer & Organizer**! We hope you find it helpful and fun to use as you study!

---
## Changes
Frontend changes to make:
Add proper game animations
Improve the gacha section (i dont know much about gacha :pensive:)
Add collaboration page
Remove header from landing and auth pages
Improve styling on notes page
Make gacha tab, notes page mobile responsive