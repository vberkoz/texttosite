# TextToSite

TextToSite is a static site generator that converts text descriptions into fully functional multi-page websites. It uses a JSON-based configuration to generate HTML, CSS, and JavaScript files for a complete website.

## Features

- Convert text descriptions to complete websites
- Generate multiple pages with consistent navigation
- Support for various section types (hero, features, team members, etc.)
- AWS deployment support via CDK

## Installation

```bash
# Clone the repository
git clone git@github.com:vberkoz/texttosite.git
cd texttosite

# Install app dependencies
npm install

# Install api dependencies
cd api
npm install

# Install cdk dependencies
cd ../cdk
npm install
```

## Usage

### Build the web interface

```bash
npm run build
```

### Install serve globally

```bash
npm install -g serve
```

### Run the web interface

```bash
serve dist
```

This will create a `dist/` directory with the web interface files.

## Project Structure

- `src/`: Source code for the web interface
  - `templates/`: HTML templates for different section types
  - `generator.js`: Core site generation logic
  - `system_prompt.txt`: Prompt for AI-based site generation
- `api/`: Lambda function for API integration
- `cdk/`: AWS CDK infrastructure code
- `dist/`: Built web interface files

## JSON Schema

The `data.json` file should follow this schema:

```json
{
  "siteMetadata": {
    "title": "string",
    "navTitle": "string",
    "description": "string",
    "author": "string"
  },
  "pages": [
    {
      "path": "string",
      "fileName": "string",
      "navLabel": "string",
      "pageTitle": "string",
      "sections": [
        {
          "type": "string (one of: hero, features, text_block, call_to_action, team_members)",
          "data": "object"
        }
      ]
    }
  ]
}
```

## Available Section Types

- `hero`: Hero section with heading, subheading, and call-to-action
- `features`: Feature list with title and items
- `text_block`: Simple text section with title and content
- `call_to_action`: Call-to-action section with heading, subheading, and button
- `team_members`: Team members section with title and member list
- `about`: About section with title and content
- `contact`: Contact form section

## Deployment

The project includes AWS CDK code for deploying to AWS:

```bash
cd cdk
npm install
npm run cdk deploy
```

## License

ISC