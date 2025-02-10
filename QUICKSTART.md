# Deep Conversational Swarm Research (DCSR)

## Overview

This project combines the concepts of Deep Research and Conversational Swarm to create a system where AI agents collaboratively research a topic, share insights, and generate a comprehensive final report. The agents are organized into subgroups, facilitating focused discussions and knowledge sharing.

## Project Structure

-   `src/`: Contains the main source code.
    -   `Agent.ts`: Defines the `Agent` class, responsible for generating responses and performing deep research.
    -   `Conversation.ts`: Defines the `Conversation` class, managing discussions within a subgroup of agents.
    -   `Network.ts`: Defines the `Network` class, responsible for managing subgroups, sharing insights, and generating the final report.
    -   `research/`: Contains research-related functionality.
        -   `deepResearch.ts`: Implements the deep research logic, including generating search queries, and scraping content.
        -   `google_search.ts`: Implements the google search functionality, based on the original deep-research package.
    -   `index.ts`: The main entry point of the application, responsible for parsing command-line arguments, configuring the system, and launching the conversations.
-   `README.md`: This file, providing an overview of the project and instructions for setup and usage.

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

## Setup

1.  Clone the `deep-conversational-research` repository:

    ```bash
    git clone <repository_url>
    cd dcsr
    ```

2.  **Build the `dcsr` image:**

    ```bash
    docker build -t deep-conversational-research_dcsr:latest .
    ```

3.  **Firecrawl Setup:**

    This project relies on `firecrawl-simple` for scraping web content. Follow these steps to set it up:

    a. Clone the `firecrawl-simple` repository:

    ```bash
    git clone git@github.com:devflowinc/firecrawl-simple.git
    cd firecrawl-simple
    ```

    b. **Configuration:**  Copy the following service definitions into your `firecrawl-simple/docker-compose.yaml` file, ensuring you don't overwrite existing configurations for other services (like `playwright-service`).

    ```yaml
    # Add this to your docker-compose.yaml

    services:
      firecrawl-api:
        image: trieve/firecrawl:v0.0.46
        networks:
          - backend
          - dcsr-net # Added dcsr-net
        environment:
          - REDIS_URL=${FIRECRAWL_REDIS_URL:-redis://redis:6379}
          - REDIS_RATE_LIMIT_URL=${FIRECRAWL_REDIS_URL:-redis://redis:6379}
          - PLAYWRIGHT_MICROSERVICE_URL=${PLAYWRIGHT_MICROSERVICE_URL:-http://playwright-service:3000}
          - PORT=${PORT:-3002}
          - NUM_WORKERS_PER_QUEUE=${NUM_WORKERS_PER_QUEUE}
          - BULL_AUTH_KEY=${BULL_AUTH_KEY}
          - TEST_API_KEY=${TEST_API_KEY}
          - HOST=${HOST:-0.0.0.0}
          - LOGGING_LEVEL=${LOGGING_LEVEL}
          - MAX_RAM=${MAX_RAM:-0.95}
          - MAX_CPU=${MAX_CPU:-0.95}
          - COREPACK_DEFAULT_TO_LATEST=0
        extra_hosts:
          - "host.docker.internal:host-gateway"
        depends_on:
          - playwright-service
        ports:
          - "3002:3002"
        command: ["pnpm", "run", "start:production"]

      firecrawl-worker:
        image: trieve/firecrawl:v0.0.46
        networks:
          - backend
          - dcsr-net # Added dcsr-net
        environment:
          - REDIS_URL=${FIRECRAWL_REDIS_URL:-redis://redis:6379}
          - REDIS_RATE_LIMIT_URL=${FIRECRAWL_REDIS_URL:-redis://redis:6379}
          - PLAYWRIGHT_MICROSERVICE_URL=${PLAYWRIGHT_MICROSERVICE_URL:-http://playwright-service:3000}
          - PORT=${PORT:-3002}
          - NUM_WORKERS_PER_QUEUE=${NUM_WORKERS_PER_QUEUE}
          - BULL_AUTH_KEY=${BULL_AUTH_KEY}
          - TEST_API_KEY=${TEST_API_KEY}
          - SCRAPING_BEE_API_KEY=${SCRAPING_BEE_API_KEY}
          - HOST=${HOST:-0.0.0.0}
          - LOGGING_LEVEL=${LOGGING_LEVEL}
          - MAX_RAM=${MAX_RAM:-0.95}
          - MAX_CPU=${MAX_CPU:-0.95}
          - COREPACK_DEFAULT_TO_LATEST=0
        extra_hosts:
          - "host.docker.internal:host-gateway"
        depends_on:
          - playwright-service
          - firecrawl-api
        command: ["pnpm", "run", "workers"]

      redis:
        image: redis:alpine
        networks:
          - backend
          - dcsr-net # Added dcsr-net
        command: redis-server --bind 0.0.0.0

    networks:
      backend:
        driver: bridge
      dcsr-net: # Added dcsr-net
        driver: bridge
    ```

    c. Run `firecrawl-simple` using Docker Compose:

    ```bash
    docker compose up -d
    ```

    `firecrawl-simple` and the dependent `firecrawl-api`, `firecrawl-worker` services will be accessible at `http://localhost:3002`.

4.  Configure environment variables:

    -   Create a `.env` file in the project root.
    -   Copy the contents of `.env.example` to your `.env` file and modify the values as needed.
    -   The following environment variables are required by both `deep-conversational-research` and `firecrawl-simple`:

        | Variable              | Description                                                                                                             | Default Value                  |
        | --------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
        | `FIRECRAWL_URL`       | The URL of your `firecrawl-simple` instance (used by `deep-conversational-research`).                                 | `http://localhost:3002`        |
        | `OPENAI_API_KEY`      | Your OpenAI API key (used by `deep-conversational-research`).                                                          |                                |
        | `OPENAI_API_URL`      | Your OpenAI API endpoint (used by `deep-conversational-research`).  If running a local server, use `http://host.docker.internal:11434`. | `https://api.openai.com`       |
        | `OPENAI_MODELS`       | A comma separated list of models to use for the agents (used by `deep-conversational-research`).  Use only the model name, without colons. | `gpt-4o-mini`                  |
        | `NUM_WORKERS_PER_QUEUE`| Number of workers per queue in `firecrawl-simple` (used by `firecrawl-api` and `firecrawl-worker`).                   | 8                              |
        | `PORT`                | Port of the `firecrawl-simple` API (used by `firecrawl-api` and `firecrawl-worker`).                                   | 3002                           |
        | `HOST`                | Host of the `firecrawl-simple` API (used by `firecrawl-api` and `firecrawl-worker`).                                   | 0.0.0.0                        |
        | `REDIS_URL`           | Redis URL for `firecrawl-simple` (used by `firecrawl-api` and `firecrawl-worker`).                                     | redis://redis:6379             |
        | `REDIS_RATE_LIMIT_URL`| Redis rate limit URL for `firecrawl-simple` (used by `firecrawl-api` and `firecrawl-worker`).                          | redis://redis:6379             |
        | `BULL_AUTH_KEY`       | Bull auth key for `firecrawl-simple` (used by `firecrawl-api` and `firecrawl-worker`).                                 | @                              |
        | `COREPACK_DEFAULT_TO_LATEST`| Disable corepack (used by `firecrawl-api` and `firecrawl-worker`).                                             | 0                              |
        | `PLAYWRIGHT_MICROSERVICE_URL` | Playwright microservice url (used by `firecrawl-api` and `firecrawl-worker`).                                 | http://playwright-service:3000 |

    -  **Note:** The `OPENAI_MODELS` environment variable should contain a comma-separated list of model names. Ensure these models are available in your OpenAI account. If using Ollama, ensure the models are pulled. Example: `OPENAI_MODELS=llama3,qwen2`

5.  **Run the DCSR application:**

    - Open a separate terminal.
    - Ensure the `firecrawl-simple` stack is running.
    - Run the `dcsr` image with the required arguments and environment variables:


    ```bash
    docker run -it --rm \
      --network firecrawl_dcsr-net \
      -e FIRECRAWL_URL=http://firecrawl-api:3002 \
      -e OPENAI_API_KEY=dummy \
      -e OPENAI_API_URL=http://host.docker.internal:11434/v1 \
      -e AGENTS=4 \
      -e GROUPS=2 \
      -e MODELS="llama3.2:3b-instruct-fp16" \
      -e RESEARCHMODEL="llama3.2:3b-instruct-fp16" \
      -e ENABLEREASEARCH=true \
      -e RESEARCHBREADTH=2 \
      -e RESEARCHDEPTH=2 \
      -e ROUNDS=3 \
      -e STEPS=5 \
      -e LOGFILE="dcsr.log" \
      -e TEXT="Discuss AI" \
      deep-conversational-research_dcsr:latest
    ```

## Project Roadmap

The project can be extended with:
-   The possibility to define different system prompts for the agents.
-   Improve the search function to use other search engines, or a search engine API.
-   Implement unit tests.
-   Implement a more sophisticated mechanism for insight sharing between subgroups.
