# Fraud Detection System

A comprehensive solution for real-time fraud detection using .NET, PostgreSQL, SignalR, and ReactJS. The system is designed to handle high transaction volumes efficiently while providing real-time feedback and a responsive user interface.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Installation](#installation)
5. [Backend Setup](#backend-setup)
6. [Frontend Setup](#frontend-setup)
7. [Usage](#usage)
8. [Contributing](#contributing)
9. [License](#license)

---

## Overview

The Fraud Detection System leverages modern technologies to detect potential fraudulent transactions in real-time. It uses the Isolation Forest algorithm on the backend for anomaly detection and provides a user-friendly frontend for monitoring and interaction.

---

## Features

- **Real-time Detection**: Immediate identification of suspicious activities using SignalR for instant updates.
- **Scalable Backend**: Built with .NET Core and PostgreSQL for high performance and scalability.
- **Intuitive Frontend**: ReactJS-based UI for an enhanced user experience.
- **Extensible Architecture**: Modular codebase for easy feature addition and maintenance.

---

## Tech Stack

### Backend
- **.NET Core**: Core application logic and API services.
- **PostgreSQL**: Database management for transaction and fraud data.
- **SignalR**: Real-time communication between the server and the frontend.

### Frontend
- **ReactJS**: User interface development.

---

## Installation

### Prerequisites

- [.NET 6 SDK](https://dotnet.microsoft.com/download/dotnet/6.0)
- [Node.js and npm](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)

---

## Backend Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-repo/fraud-detection.git
   cd fraud-detection/backend
   ```

2. **Configure Environment Variables:**
   Create an `appsettings.json` file or use environment variables for configuration:
   ```json
   {
       "ConnectionStrings": {
           "DefaultConnection": "Host=localhost;Port=5432;Database=FraudDetection;Username=postgres;Password=yourpassword"
       }
   }
   ```

3. **Run Database Migrations:**
   ```bash
   dotnet ef database update
   ```

4. **Start the Backend:**
   ```bash
   dotnet run
   ```

---

## Frontend Setup

1. **Navigate to the Frontend Directory:**
   ```bash
   cd fraud-detection/frontend
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file with the following:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   ```

4. **Start the Frontend:**
   ```bash
   npm start
   ```

---

## Usage

1. Access the frontend at `http://localhost:3000`.
2. Use the interface to monitor transactions and review flagged activities.
3. The system provides real-time updates for transactions via SignalR.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature-name`.
3. Commit your changes: `git commit -m 'Add some feature'`.
4. Push to the branch: `git push origin feature-name`.
5. Open a pull request.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
