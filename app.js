const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const MongoDBStore = require("connect-mongodb-session")(session);
const flash = require("connect-flash");
require("dotenv").config();

const app = express();

// MongoDB connection
const connectDB = require("./db/connect");

// Import routes
const jobRoutes = require("./routes/jobs");

// Set up view engine
app.set("view engine", "ejs");

// CSRF Protection
const csrfProtection = csrf({ cookie: true });

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());  // Cookie-parser middleware

// Session setup
const store = new MongoDBStore({
    uri: process.env.MONGO_URI,
    collection: "mySessions",
});
store.on("error", function (error) {
    console.log(error);
});

const sessionParams = {
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: store,
    cookie: { secure: false, sameSite: "strict" },
};

if (app.get("env") === "production") {
    app.set("trust proxy", 1);
    sessionParams.cookie.secure = true; 
}

app.use(session(sessionParams));
app.use(flash());
app.use(csrfProtection); // Use CSRF protection middleware

// Pass CSRF token to all views
app.use((req, res, next) => {
    res.locals._csrf = req.csrfToken(); // Pass _csrf token to all views
    next();
});

// Route Definitions

// Secret Word Route
app.get("/secretWord", (req, res) => {
    res.send("This is the secret word page.");
});

// Jobs route with CSRF token
app.use("/jobs", jobRoutes);

// 404 and Error Handling
app.use((req, res) => {
    res.status(404).send(`That page (${req.url}) was not found.`);
});

app.use((err, req, res, next) => {
    res.status(500).send(err.message);
    console.log(err);
});

// Start server
const port = process.env.PORT || 5000;

const start = async () => {
    try {
        // Connect to MongoDB
        await connectDB(process.env.MONGO_URI);

        // Start the server
        app.listen(port, () =>
            console.log(`Server is listening on port ${port}...`)
        );
    } catch (error) {
        console.log(error);
    }
};

start();