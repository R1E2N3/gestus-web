# Sign Language Recognition Web App

A Next.js web application for real-time sign language recognition using webcam or video upload.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file:
```
NEXT_PUBLIC_API_URL=https://your-api-url.com
```

3. Run the development server:
```bash
npm run dev
```

## Deployment

This app is configured for deployment on Vercel:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add the environment variable:
   - `NEXT_PUBLIC_API_URL`: Your Python API URL

## Features

- Real-time webcam recording
- Video file upload
- Multiple camera support
- Sign language recognition
- Confidence scores for predictions

## Tech Stack

- Next.js
- TypeScript
- MediaRecorder API
- WebRTC