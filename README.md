Certainly! Here's the updated README file with the environment variables section removed:

```markdown
# Email Automation System

This project automates email handling using Node.js, integrating with Gmail and Outlook APIs.

## Features

- **Queue System**: Uses BullMQ for asynchronous job processing.
- **Email Integration**: Fetches and responds to emails from Gmail and Outlook.
- **Natural Language Processing**: Analyzes email content using Google's Generative AI.

## Prerequisites

Ensure you have the following installed on your machine:

- Node.js (version >= 12.0.0)
- Redis server

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/email-automation.git
   cd email-automation
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the root directory and add your environment variables:

   ```plaintext
   PORT=
   GOOGLE_CLIENT_ID=
   GOOGLE_CLIENT_SECRET=
   GOOGLE_REDIRECT_URI=
   REDIS_HOST=
   REDIS_PORT=
   OPENAI_SECRET_KEY=
   AZURE_CLIENT_ID=
   AZURE_CLIENT_SECRET=
   AZURE_TENANT_ID=
   AZURE_REDIRECT_URI=
   GEMINI_API_KEY=
   ```

   Replace these variables with your actual credentials and API keys.

## Usage

Start the email automation system:

```bash
npx tsc
node dist/index.js
```

Access the following endpoints in your browser:

- Gmail Authentication: `http://localhost:<your_port>/auth/gmail`
- Outlook Authentication: `http://localhost:<your_port>/auth/outlook`

## Configuration

- **Redis Configuration**: Default connection to `localhost:6379`. Modify `redisConnection` in `src/utils/bullmq.ts` for different configurations.
- **API Keys**: Ensure correct API keys are set in the `.env` file.

## Contributing

Feel free to fork the repository and submit pull requests.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
```

### Notes:
- The `.env` file section now contains placeholders (`=`), prompting users to fill in their own values.
- Ensure to provide the correct endpoints and configurations as per your specific setup.
- Modify any other paths or configurations as needed for your project.
