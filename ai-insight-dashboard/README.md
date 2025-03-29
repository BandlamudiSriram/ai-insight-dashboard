
# DataQuery Dashboard

## Project Overview

DataQuery Dashboard is a powerful business analytics platform that allows users to query their data using natural language. Leveraging the Gemini API from Google, the application translates conversational queries into meaningful insights and visualizations.

## Key Features

- **Natural Language Processing**: Query your data using simple English phrases
- **Interactive Visualizations**: View your data through dynamic charts and graphs
- **Query History**: Track and revisit previous queries
- **File Upload**: Import your business data in various formats
- **Responsive Design**: Access insights from any device

## Technology Stack

- **Frontend**: React with TypeScript for type safety
- **UI Components**: Tailwind CSS and shadcn/ui for modern UI elements
- **Data Visualization**: Recharts for creating interactive charts
- **AI Integration**: Gemini API for natural language processing
- **Development**: Vite for fast development and building

## Setup Instructions

1. Clone the repository:
   ```
   git clone [repository-url]
   cd dataquery-dashboard
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure the Gemini API:
   - Obtain an API key from [Google AI Studio](https://makersuite.google.com/)
   - Create a `.env` file in the project root with:
     ```
     VITE_GEMINI_API_KEY=provide_API_key
     ```
   - Replace `provide_API_key` with your actual Gemini API key

4. Start the development server:
   ```
   npm run dev
   ```

## Deployment

### Vercel Deployment

1. Push your code to a Git repository
2. Create a new project on Vercel
3. Link your repository
4. Add the environment variable `VITE_GEMINI_API_KEY` with your uploaded API key in your Vercel project settings
5. Deploy

## How It Works

1. **Upload Data**: Import your business data through the file upload component
2. **Ask Questions**: Type natural language queries about your data
3. **View Insights**: See the results visualized in appropriate charts
4. **Track History**: Review previous queries and their results

## Project Structure

- `src/components/`: UI components including data table, file upload, and query interface
- `src/utils/gemini.ts`: Integration with Google's Gemini API for natural language processing
- `src/pages/`: Application pages and routing

## Future Enhancements

- Support for more data formats
- Advanced visualization options
- User authentication and saved dashboards
- Export capabilities for reports
