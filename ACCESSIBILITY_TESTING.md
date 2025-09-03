# Accessibility and Lighthouse Testing

This project uses Node's built-in test runner to provide lightweight accessibility and SEO checks that work without external dependencies.

## Available Scripts

- `npm test` – run all tests
- `npm run test:accessibility` – verify the HTML document has a language attribute and images include `alt` text
- `npm run test:lighthouse` – perform basic SEO checks for a meta description tag and the existence of `robots.txt`

These tests run in environments without network access or additional CLI tools.
