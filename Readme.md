~ Tech Stack Overview: MERN Stack (MongoDB, Express.js, React.js, Node.js) 

~ Key Packages: (bcryptjs, jsonwebtoken, mongoose, morgan).

~ Project Architecture: Brief explaination about the Modular MVC structure:

Plaintext
├── models/         # Mongoose schemas (User, Workout, Nutrition, Progress, Reminder, Notification, Support, Preference)
├── controllers/    # Business logic & database operations
├── routes/         # Express endpoint routing
├── middleware/     # JWT authentication & error handling
└── server.js       # Entry point & DB connection

~ Installation & Running Steps:

1. Install dependencies: npm install
2. Start server: npm run dev