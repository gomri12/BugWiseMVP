# BugWise MVP

> **End the Groundhog Day of Debugging**

BugWise is an intelligence platform that connects Jira, GitHub, Sentry, and Datadog to identify and resolve recurring bugs using AI-powered root cause analysis.

## 🎯 Overview

BugWise solves the frustrating problem of recurring bugs that seem to be "fixed" but keep coming back. By correlating data from multiple development and monitoring tools, BugWise provides intelligent insights into why bugs persist and how to truly resolve them.

### Key Features

- **🔗 Multi-Tool Integration**: Seamlessly connects with Jira, GitHub, Sentry, and Datadog
- **🤖 AI-Powered Analysis**: Uses Google Gemini AI to analyze bug patterns and provide root cause insights
- **📊 Visual Correlation**: Interactive dashboards showing relationships between code changes, errors, and tickets
- **🎯 Bug Clustering**: Automatically groups related bugs to identify patterns
- **📈 Real-time Monitoring**: Live sync with connected services for up-to-date insights
- **💡 Intelligent Recommendations**: AI-generated analysis explaining why bugs recur despite previous fixes

## 🚀 Live Demo

Visit the live application: **[https://gomri12.github.io/BugWiseMVP](https://gomri12.github.io/BugWiseMVP)**

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **AI**: Google Gemini API (@google/genai)
- **Deployment**: GitHub Pages with GitHub Actions

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/gomri12/BugWiseMVP.git
   cd BugWiseMVP
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables** (optional)
   
   Create a `.env.local` file:
   ```env
   VITE_API_KEY=your_gemini_api_key_here
   ```
   
   > **Note**: The app works without an API key using simulated AI responses for demonstration purposes.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173`

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run deploy` - Deploy to GitHub Pages (using gh-pages)

## 🏗️ Project Structure

```
BugWiseMVP/
├── components/
│   └── Layout.tsx          # Main layout component
├── services/
│   └── geminiService.ts    # AI service integration
├── App.tsx                 # Main application component
├── constants.ts            # Mock data and constants
├── types.ts                # TypeScript type definitions
├── index.tsx               # Application entry point
├── vite.config.ts          # Vite configuration
└── package.json            # Dependencies and scripts
```

## 🎨 Features in Detail

### Integration Management

Connect and disconnect from various development tools:
- **Jira**: Sync tickets and metadata
- **GitHub**: Analyze commits and pull requests
- **Sentry**: Ingest stack traces and error reports
- **Datadog**: Correlate system logs and metrics

### Bug Clustering

Automatically groups related bugs based on:
- Similar error patterns
- Code change correlations
- Temporal relationships
- Metadata matching

### AI Root Cause Analysis

Leverages Google Gemini AI to:
- Analyze correlations between code changes and errors
- Explain why bugs recur despite previous fixes
- Provide technical summaries for engineering teams
- Identify patterns across multiple data sources

### Dashboard Analytics

Comprehensive visualizations including:
- Bug trend charts
- Impact analysis
- Integration status
- Correlation heatmaps
- Recurrence patterns

## 🔧 Configuration

### Base Path

The application is configured for GitHub Pages deployment. The base path is set in `vite.config.ts`:

```typescript
base: '/BugWiseMVP/'
```

If deploying to a different location, update this value accordingly.

### AI Service

The AI service uses Google Gemini API. Configure your API key in `.env.local`:

```env
VITE_API_KEY=your_api_key_here
```

Without an API key, the service will return simulated responses for demonstration.

## 🚢 Deployment

### GitHub Pages (Automatic)

The project is configured for automatic deployment via GitHub Actions:

1. Push to the `main` branch
2. GitHub Actions will automatically:
   - Install dependencies
   - Build the project
   - Deploy to GitHub Pages

The workflow file is located at `.github/workflows/deploy.yml`.

### Manual Deployment

To deploy manually:

```bash
npm run build
npm run deploy
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is a proof of concept (MVP). See the repository for license details.

## 🔮 Future Enhancements

- Real API integrations (currently using mock data)
- Advanced machine learning models for pattern detection
- Custom alerting and notification system
- Team collaboration features
- Historical trend analysis
- Export capabilities for reports

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Built with ❤️ to end the Groundhog Day of debugging**
