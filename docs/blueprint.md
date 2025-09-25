# **App Name**: GSTeezy

## Core Features:

- Amount Input: Input field for the original amount before GST.
- GST Rate Input: Input field for the GST rate (percentage).
- Calculate GST: Button to trigger the Cloud Function for GST calculation.
- GST Calculation (Cloud Function): Cloud Function to calculate GST amount and total amount securely.
- Result Display: Display the calculated GST amount and total amount.
- Calculation Logging: Log calculations with timestamp and user ID (if signed in) to Firestore.
- Calculation History Display: Display the last 5 calculations for signed-in users, retrieved from Firestore. Use a tool to assess the user's data retrieval limits to provide effective alerts on limits exceeded.

## Style Guidelines:

- Primary color: Vivid blue (#29ABE2) to represent clarity and financial accuracy.
- Background color: Light blue (#E1F5FE) for a clean and professional look.
- Accent color: Soft green (#9CCC65) to highlight positive results and actions.
- Body and headline font: 'Inter' sans-serif for a modern, neutral, and readable interface.
- Use simple, clear icons for input fields and calculation results.
- Clean, responsive layout with clear sections for input, calculation, and results.
- Subtle animations for calculation results to provide visual feedback.