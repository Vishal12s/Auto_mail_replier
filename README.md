# Gmail Auto Replies using OpenAI

This Node.js script reads Gmail messages, generates automatic replies using OpenAI, and sends replies to the respective emails. It provides a convenient way to automate responses to incoming emails.

## Prerequisites

Before using this script, ensure you have the following:

1. **Node.js**: Make sure Node.js is installed on your system. You can download it from [here](https://nodejs.org/).

2. **Gmail API Credentials**: Enable the Gmail API and obtain OAuth 2.0 credentials. Follow the steps below:

   - Go to the [Google Cloud Console](https://console.cloud.google.com/).
   - Create a new project.
   - Enable the Gmail API for your project.
   - Create OAuth 2.0 credentials (client ID and client secret).
   - Download the credentials file (usually named `credentials.json`) and save it in the project directory.

3. **OpenAI API Key**: You need an API key from OpenAI to use their services. Follow these steps to obtain the API key:

   - Sign up or log in to your OpenAI account on the [OpenAI website](https://platform.openai.com/signup).
   - Go to your account settings and generate an API key.
   - Copy the API key and save it. 

Installation
Clone the repository to your local machine:

bash
Copy code
git clone https://github.com/your_username/your_repository.git
Navigate to the project directory:

bash
Copy code
cd Gmail-auto-replies-using-OpenAI
Install dependencies:

bash
Copy code
npm install
Usage
Run the script:

bash
Copy code
node script.js
Follow the authorization steps prompted in the terminal to authorize the script to access your Gmail account.

The script will read your unread emails, generate automatic replies using OpenAI, and send the replies to the respective emails.
