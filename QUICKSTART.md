# Deep Conversational Swarm Research (DCSR)

## Overview

This project implements a Deep Conversational Swarm Research system where AI agents collaboratively research a given topic, share insights, and generate a comprehensive final report. The agents are organized into subgroups to facilitate focused discussions and knowledge sharing, all orchestrated using Docker Compose. The project integrates Firecrawl for web scraping and manages all services via Docker Compose, simplifying setup and deployment.

## Project Structure

-   `src/`: Contains the main source code.
    -   `Agent.ts`: Defines the `Agent` class, responsible for generating responses and performing deep research.
    -   `Conversation.ts`: Defines the `Conversation` class, managing discussions within a subgroup of agents.
    -   `Network.ts`: Defines the `Network` class, responsible for managing subgroups, sharing insights, and generating the final report.
    -   `research/`: Contains research-related functionality.
        -   `deepResearch.ts`: Implements the deep research logic, including generating search queries and scraping content using Firecrawl.
        -   `ddgs.ts`: Implements the DuckDuckGo search functionality.
    -   `frontend/`: Contains the React frontend code.
        -   `App.jsx`: Main React component.
        -   `ConversationForm.jsx`: Component for starting a conversation.
        -   `EventLog.jsx`: Component for displaying the event log.
        -   `FinalReports.jsx`: Component for displaying the final reports.
        -   `GroupConversations.jsx`: Component for displaying group conversations.
        -   `Overview.jsx`: Component for displaying the overview.
        -   `index.html`: Main HTML file for the frontend.
    -   `index.ts`: The main entry point of the application, responsible for parsing command-line arguments, configuring the system, and launching the conversations.
    -   `cli.ts`: Command line interface.
    -   `logger.ts`: Logger class for logging events.
    -   `server.ts`: Express server to handle the frontend and websocket.
    -   `utils.ts`: Utility functions.
-   `docker-compose.yaml`: Defines the services, networks, and volumes for the application.
-   `README.md`: This file, providing an overview of the project and instructions for setup and usage.
-   `.env.example`: Example environment variables file.
-   `package.json`: Lists project dependencies and scripts.
-   `tsconfig.json`: Configuration file for the TypeScript compiler.

## Dependencies

-   dotenv
-   js-tiktoken
-   jsdom
-   lodash-es
-   node-fetch
-   openai
-   p-limit
-   typescript
-   zod
-   express
-   ws
-   react
-   react-dom
-   parcel

## Setup

1.  Clone the `deep-conversational-research` repository:

    ```bash
    git clone <repository_url>
    cd dcsr
    ```

2.  **Firecrawl Setup:**

    This project relies on `firecrawl-simple` for scraping web content. The necessary Firecrawl services (API, worker, Redis, and Playwright service) are included and configured via the `docker-compose.yaml` file.

3.  Configure environment variables:

    -   Create a `.env` file in the project root.
    -   Copy the contents of `.env.example` to your `.env` file and modify the values as needed.
        **It is crucial to review all environment variables and adjust them according to your specific setup before running the application.**

    -   The following environment variables are required:

        | Variable                      | Description                                                                                                                                                           | Default Value                       |
        | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
        | `PORT`                        | The port the application listens on.                                                                                                                                   | `3210`                              |
        | `OPENAI_API_KEY`              | Your OpenAI API key.                                                                                                                                                  |                                       |
        | `OPENAI_API_URL`              | Your OpenAI API endpoint. If running a local server, use `http://host.docker.internal:11434/v1`.                                                                        | `https://api.openai.com`            |


4.  **Run the DCSR application:**

    -   Ensure Docker is running.
    -   Navigate to the root directory of the project (`dcsr`).
    -   Run the following command to start all services defined in `docker-compose.yaml`:

        ```bash
        docker compose up -d
        ```

        This command builds the `deep-conversational-research` image, starts the Firecrawl services, Redis, and the DCSR application. The application will be accessible at `http://localhost:3210`.

## Accessing the Frontend

Once the application is running, you can access the frontend in your web browser at `http://localhost:3210`. The frontend provides a user interface to start new conversational research sessions and view the results.
