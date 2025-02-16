# AI-Notes

A React.js based note-taking application with text and voice input, featuring authentication, real-time search, and multimedia support. Users can create, edit, delete, and manage notes with both text and audio.

## Features

- **Authentication**: Secure JWT-based login and sign-up.
- **Note Management**: Store notes in MongoDB, sort from old to new, and manage notes with CRUD operations.
- **Voice Notes**: Record up to 1-minute audio, transcribe using the Web Speech API, and save the text.
- **Search & Filters**: Real-time search across note titles and content.
- **Multimedia Support**: Upload and store images via ImgBB, and audio via ByteScale.
- **Protected Routes**: Secure pages using authentication middleware.

## Tech Stack

### Frontend:
- React.js
- Tailwind CSS
- React Context API (for authentication handling)

### Backend:
- Node.js
- Express.js
- MongoDB
- JWT for authentication
- Multer for file handling

### Third-Party Services:
- **ImgBB**: For image uploads.
- **ByteScale**: For audio storage.
- **Web Speech API**: For speech-to-text transcription.

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/VPS010/AI-Notes.git
   ```
2. Navigate to the project directory:
   ```sh
   cd AI-Notes
   ```
   
### Docker Setup
This project supports Docker. To run it in containers:
```sh
docker compose up -d
```

### Running Backend
```sh
cd backend
npm install
npm start
```

### Running Frontend
```sh
cd frontend
npm install
npm run dev
```

