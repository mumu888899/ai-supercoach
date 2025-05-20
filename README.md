
# Firebase Studio

This is a NextJS starter in Firebase Studio.

This project is a workout planner application designed to help users manage their fitness journey. It allows users to set personal fitness goals, leverage AI to generate personalized workout plans, log their completed workouts, and visualize their progress over time.

To get started, take a look at src/app/page.tsx.

## Setup Environment Variables

For AI features to work, you need to provide a Google AI API key.

1.  Create a `.env` file in the root of your project (if it doesn't exist already).
2.  Obtain an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
3.  Add the API key to your `.env` file. The Genkit Google AI plugin typically looks for `GOOGLE_API_KEY` or `GEMINI_API_KEY`. For example:

    ```env
    GOOGLE_API_KEY=YOUR_API_KEY_HERE
    ```
    or
    ```env
    GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```

    Replace `YOUR_API_KEY_HERE` with your actual API key.

## Features

*   User authentication (Sign up and Log in)
*   Setting fitness goals
*   AI-powered personalized workout plan generation
*   Workout logging with RPE and notes
*   AI feedback on logged workouts
*   Progress tracking and visualization

