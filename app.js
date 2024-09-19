const express = require("express");
require("express-async-errors");
require("dotenv").config(); 

const app = express();
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const flash = require("connect-flash");
const passport = require("passport");
const passportInit = require("./passport/passportInit");

// MongoDB connection
const connectDB = require("./db/connect");

// Import routes
const sessionRoutes = require("./routes/sessionRoutes");  

// Set up view engine
app.set("view engine", "ejs");

// Middleware
app.use(require("body-parser").urlencoded({ extended: true }));

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

// Initialize Passport
passportInit();
app.use(passport.initialize());
app.use(passport.session());

// Middleware to set flash messages in res.locals
app.use((req, res, next) => {
  res.locals.info = req.flash("info");
  res.locals.errors = req.flash("error");
  next();
});

app.get("/register", (req, res) => {
  res.render("register");  
});

// Routes
app.get("/", (req, res) => {
  res.render("home");
});

// Use session routes
app.use("/sessions", sessionRoutes);  

// GET route for displaying secretWord page
app.get("/secretWord", (req, res) => {
  const secretWord = "SuperSecretWord";  
  res.render("secretWord", { secretWord });
});

// POST route for updating the secretWord
app.post("/secretWord", (req, res) => {
  const newSecretWord = req.body.secretWord; 
  res.render("secretWord", { secretWord: newSecretWord }); 
});

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