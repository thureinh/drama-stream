# WasabiStream AI

A modern, mobile-first video discovery platform built with Next.js and AI capabilities.

## Features

- 📱 **Mobile-First Design**: Optimized for vertical video content and touch interactions.
- 🔍 **Smart Discovery**: Advanced search, filtering, and sorting to find the perfect clip.
- 🏷️ **Rich Metadata**: Categorization by genre and smart tagging system.
- 🎨 **Modern UI**: Sleek, dark-mode interface powered by Tailwind CSS 4.
- 🤖 **AI Powered**: Integration with Google GenAI for intelligent features.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **AI**: Google GenAI SDK

## Getting Started

### Prerequisites

- Node.js 18+ installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd wasabistream-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add your keys:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the app.

## Docker

### Development (Live Editing)

Run the app with hot-reloading enabled using Docker Compose:

```bash
docker compose up --build -d
```

- Access the app at: http://localhost:3000
- Changes to files will automatically reload.
- **Verify Dependencies**: `docker compose exec web yt-dlp --version`

### Production (Standalone)

Build and run the optimized production image:

```bash
# Build
docker build -t wasabistream-ai .

# Run
docker run -d -p 80:3000 --env-file .env.local --restart always --name wasabistream-ai wasabistream-ai

```

- Access the app at: http://localhost:3000
- **Verify Dependencies**: `docker run --rm wasabistream-ai yt-dlp --version`
