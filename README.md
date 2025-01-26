# College Placement Platform 

A robust and modern platform for hosting college placement processes, built using *Next.js, **TypeScript, and **Firebase*. 

The application simplifies the workflow for colleges, companies, and students, offering a seamless experience for managing recruitment processes.

 ## Features - 

*User Roles*: Separate views and functionalities for students, companies, and administrators. - 

*Authentication*: Secure user sign-up and login using Firebase Authentication. - 

*Real-time Updates*: Leveraging Firebase Firestore for instant data synchronization. - 

*Dashboard*: A centralized hub for managing applications, job postings, and candidate progress. - 

*Notifications*: Push updates to keep users informed about placement events and deadlines. - 

*Responsive Design*: Optimized for all devices, ensuring a smooth user experience across desktops, tablets, and smartphones. 

## Tech Stack - 

*Frontend: [Next.js](https://nextjs.org/) with **TypeScript* - 

*Backend: Firebase Functions - **Database*: Firebase Firestore - 

*Hosting*: Firebase Hosting

 ## Installation 

### Prerequisites - Node.js (>= 18) - Firebase CLI installed ([Guide](https://firebase.google.com/docs/cli))

Steps 1. Clone the repository: ```(bash) git clone https://github.com/AadityaKhurana/college-placement-portal

Step 2.Install dependencies: (Bash)npm install

Step 3.Set up Firebase:
•⁠  ⁠Create a new Firebase project on the Firebase Console.
•⁠  ⁠Copy the firebaseConfig from your project and replace it in firebase.js.

Step 4.Run development server: (bash) npm run dev

Step 5.Open http://localhost:3000 to view the application in your browser.

Project Structure

📦 college-placement-platform
├── public/           # Static assets
├── src/
│   ├── components/   # Reusable UI components
│   ├── pages/        # Next.js routes
│   ├── styles/       # Global and component styles
│   ├── utils/        # Helper functions
│   ├── firebase/     # Firebase configuration and API calls
├── .env.local        # Environment variables
└── README.md         # Project documentation

Deployment

(Bash)  npm run build
(Bash)  firebase deploy. 

Contributing
Contributions are welcome! Please follow these steps:
1.⁠ ⁠Fork the repository.
2.⁠ ⁠Create a new branch: git checkout -b feature-name.
3.⁠ ⁠Commit your changes: git commit -m "Add feature-name".
4.⁠ ⁠Push to the branch: git push origin feature-name.
5.⁠ ⁠Submit a pull request.

License
This project is licensed under the MIT License.

Acknowledgements
Special thanks to https://github.com/Pasta-coder (Jayant Chauhan) for his contributions and support.