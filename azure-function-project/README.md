# Azure Function Project

This project is an Azure Function that generates a random architecture based on a specified difficulty level. It utilizes Python and is structured to facilitate local development and deployment.

## Project Structure

```
azure-function-project
├── generate_architecture
│   ├── __init__.py       # Contains the main logic for the Azure Function
│   ├── function.json     # Configuration for the Azure Function
├── host.json             # Global configuration options for all functions
├── local.settings.json    # Local development settings
└── README.md             # Project documentation
```

## Getting Started

### Prerequisites

- Python 3.6 or later
- Azure Functions Core Tools
- An Azure account (for deployment)

### Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd azure-function-project
   ```

2. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

3. Configure local settings:
   - Update `local.settings.json` with your development settings.

### Running the Function Locally

To run the Azure Function locally, use the following command:

```
func start
```

This will start the function host and allow you to test the function locally.

### Testing the Function

You can test the function by sending an HTTP POST request to the endpoint:

```
POST http://localhost:7071/api/generate_architecture
Content-Type: application/json

{
    "difficulty": "BEGINNER"
}
```

### Deployment

To deploy the function to Azure, use the Azure Functions Core Tools:

```
func azure functionapp publish <function-app-name>
```

## License

This project is licensed under the MIT License. See the LICENSE file for details.