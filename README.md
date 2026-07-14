# Nexora Smart BPMN 🚀

Nexora Smart BPMN is a modern, AI-powered Business Process Model and Notation (BPMN) editor. Built with React and integrated with Firebase and OpenAI, it allows users to effortlessly map out, manage, and optimize complex business processes.

## ✨ Features
- **Interactive BPMN Editor**: Visually construct and edit business processes using an intuitive drag-and-drop interface.
- **AI-Powered Assistance**: Integrated with OpenAI to provide intelligent suggestions and optimizations for your business workflows.
- **Real-Time Database**: Powered by Firebase Firestore for saving and retrieving process diagrams seamlessly.
- **Secure Authentication**: Built-in user authentication (Google / Email) to keep business workflows secure and private.
- **Demo Mode**: Includes a `VITE_DEMO_MODE` flag so developers can test and view the UI instantly with mock data, without needing to set up a backend database!

![Workspace](public/images/Nexora.png)

---

## 📦 Prerequisites

To deploy and use Nexora Smart BPMN locally, you will need:
- **Node.js** (v16 or higher) installed on your machine.
- A **Firebase** project with **Firestore Database** and **Authentication** enabled.
- An **OpenAI API Key** to power the intelligent features.

---

## 🏎️ Quick Start (Demo Mode)

Want to see what Nexora Smart BPMN looks like without configuring any databases or APIs? 

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/Nexora-Smart-BPMN.git
   cd Nexora-Smart-BPMN
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up the environment:**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

4. **Enable Demo Mode:** 
   Open the `.env` file and set `VITE_DEMO_MODE` to `true`:
   ```env
   VITE_DEMO_MODE=true
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

*Navigate to `http://localhost:5173` in your browser. You will instantly bypass login and can start building smart business processes using mock data!*

---

## 🔧 Full Setup (Production / Real Data)

To use Nexora Smart BPMN for a real event, you must link it to your Firebase and OpenAI accounts.

1. **Ensure `VITE_DEMO_MODE=false` in your `.env` file.**
2. **Add your credentials:**
   Open `.env` and fill out your Firebase and OpenAI keys:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   
   VITE_OPENAI_API_KEY=your_openai_api_key
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

*Navigate to `http://localhost:5173` in your browser to start building smart business processes with real cloud persistence!*

---

## 🚀 Deployment

Nexora Smart BPMN is a Vite React application, which makes deployment extremely simple:
- **Vercel**: Import your repository directly. Vercel automatically detects Vite configurations.
- **Firebase Hosting**: Run `npm run build` followed by `firebase deploy --only hosting`.
*(Remember to add your `.env` variables to your hosting provider's dashboard!)*

---

## 💻 Technologies Used
- **Frontend**: React, Vite, TailwindCSS
- **Backend & Auth**: Firebase (Firestore, Authentication)
- **AI Integration**: OpenAI API
- **Language**: TypeScript

---

## 🤝 Contributing

Contributions, issues, and feature requests are always welcome! Feel free to check the [issues page](https://github.com/your-username/Nexora-Smart-BPMN/issues).

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
