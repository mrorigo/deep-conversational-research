# Deep Conversational Swarm Research (DCSR)

## Overview

This project implements a Deep Conversational Swarm Research system where AI agents collaboratively research a given topic, share insights, and generate a comprehensive final report. The agents are organized into subgroups to facilitate focused discussions and knowledge sharing, all orchestrated using Docker Compose. The project integrates Firecrawl for web scraping and manages all services via Docker Compose, simplifying setup and deployment. The logs are stored in a postgres database. A React frontend is included to interact with the application.

## Project Structure

-   `src/`: Contains the main source code.
    -   `Agent.ts`: Defines the `Agent` class, responsible for generating responses and performing deep research.
    -   `Conversation.ts`: Defines the `Conversation.ts` class, managing discussions within a subgroup of agents.
    -   `Network.ts`: Defines the `Network` class, responsible for managing subgroups, sharing insights, and generating the final report.
    -   `research/`: Contains research-related functionality.
        -   `deepResearch.ts`: Implements the deep research logic, including generating search queries and scraping content using DuckDuckGo Search and Firecrawl.
        -   `ddgs.ts`: Implements the DuckDuckGo search functionality.
    -   `frontend/`: Contains the React frontend code.
        -   `App.jsx`: Main React component.
        -   `index.html`: Main HTML file for the frontend.
    -   `index.ts`: The main entry point of the application, responsible for configuring the system and launching the conversations.
    -   `logger.ts`: Logger class for logging events to a Postgres database.
    -   `server.ts`: Express server to handle the frontend and websocket communication with the backend.
    -   `utils.ts`: Utility functions.
-   `docker-compose.yaml`: Defines the services, networks, and volumes for the application.
-   `README.md`: This file, providing an overview of the project and instructions for setup and usage.
-   `.env.example`: Example environment variables file.
-   `package.json`: Lists project dependencies and scripts.
-   `tsconfig.json`: Configuration file for the TypeScript compiler.
-   `entrypoint.sh`: Entrypoint script for the Docker container.

## Dependencies

-   `dotenv`
-   `express`
-   `js-tiktoken`
-   `jsdom`
-   `lodash-es`
-   `openai`
-   `p-limit`
-   `pg`
-   `react`
-   `react-dom`
-   `typescript`
-   `ws`
-   `zod`
-   `parcel`

## Setup

1.  Clone the `deep-conversational-research` repository:

    ```bash
    git clone <repository_url>
    cd deep-conversational-research
    ```

2.  **Firecrawl Setup:**

    This project relies on `firecrawl` for scraping web content. The necessary Firecrawl services (API, worker, Redis, and Playwright service) are included and configured via the `docker-compose.yaml` file.  You will need to ensure the `FIRECRAWL_URL` environment variable is set correctly, pointing to the `firecrawl-api` service.

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
        | `FIRECRAWL_URL`             | URL for the Firecrawl API service.  This should match the service name and port in your docker-compose.yaml, e.g., `http://firecrawl-api:3002`.                       | `http://firecrawl-api:3002` |

4.  **Run the DCSR application:**

    -   Ensure Docker is running.
    -   Navigate to the root directory of the project (`deep-conversational-research`).
    -   Run the following command to start all services defined in `docker-compose.yaml`:

        ```bash
        docker compose up -d
        ```

        This command builds the `deep-conversational-research` image, starts the Firecrawl services, Redis, Postgres and the DCSR application. The application will be accessible at `http://localhost:3210`.

## Accessing the Frontend

Once the application is running, you can access the frontend in your web browser at `http://localhost:3210`. The frontend provides a user interface to start new conversational research sessions and view the results.

## Accessing the Logs

The application logs are stored in a Postgres database.  You can query the database directly to view the logs.  The `logger.ts` file contains the code for writing logs to the database. The database connection details are configured using the environment variables described above. You can connect to the postgres database using a client like `psql` or a GUI tool like pgAdmin.

Example using `psql`:

```bash
psql -h localhost -p 65432 -U postgres -d deep_conversational_research
```

You will be prompted for the password, which is set in the `.env` file.

Then, you can query the logs table:

```sql
SELECT * FROM logs;
```
