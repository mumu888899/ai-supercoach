
import { genkit, type GenkitPlugin } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const plugins: GenkitPlugin[] = [];

// Check if the API key is present in the environment.
// Next.js automatically loads .env variables into process.env on the server.
// The Google AI plugin typically looks for GOOGLE_API_KEY or GEMINI_API_KEY.
if (process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY) {
  plugins.push(googleAI());
} else {
  // This console.warn will appear in the Next.js server logs if the key is missing
  console.warn(
    `\n🔴 WARNING: GOOGLE_API_KEY or GEMINI_API_KEY is not set in your .env file.
AI features will not be available.
To enable AI features, please add your API key to the .env file in the root of your project.
For example:
GOOGLE_API_KEY=YOUR_API_KEY_HERE
or
GEMINI_API_KEY=YOUR_API_KEY_HERE
You can obtain an API key from Google AI Studio: https://aistudio.google.com/app/apikey
\n`
  );
  // If the plugin is not added, AI flows relying on Google AI models will fail when called.
}

export const ai = genkit({
  plugins: plugins,
  // The default model will only be available if the googleAI plugin is successfully loaded.
  // Calls to ai.generate() will fail if the model provider is not available.
  model: 'googleai/gemini-2.0-flash',
});
