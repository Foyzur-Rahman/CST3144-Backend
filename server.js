// Imports necessary modules
const express = require('express'); // Framework for building the server
const { MongoClient, ObjectId } = require('mongodb'); // MongoDB driver for database interaction
const cors = require('cors'); // Middleware 
const path = require('path'); // Handling file paths

// Initialise the Express application
const app = express();

// Standard middleware setup
app.use(express.json()); 
app.use(cors()); // Allow requests from different files like frontend

// Mongodb connection
const uri = "mongodb+srv://foyzur2005:Foyzur12@cluster0.lhuwfxq.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri);
let db;

// Connects mongodb and tells us in terminal if it connected or not
async function connectDB() {
    try {
        await client.connect();
        db = client.db("school");
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Connection failed:", err);
    }
}

// Logger middleware
// Logs the method and URL of every incoming request
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Static files middleware
// Serves images from the 'images' directory
app.use('/images', express.static(path.join(__dirname, 'images')));

// Routes

// GET /lessons
// Retrieves the full list of lessons from the database
app.get('/lessons', async (req, res) => {
    try {
        const lessons = await db.collection('lessons').find({}).toArray();
        res.json(lessons);
    } catch (err) {
        res.status(500).send("Failed to retrieve lessons");
    }
});

// GET /search
// Filters lessons based on a query string (subject or location)
app.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        const results = await db.collection('lessons').find({
            $or: [
                { subject: { $regex: query, $options: 'i' } },
                { location: { $regex: query, $options: 'i' } }
            ]
        }).toArray();
        res.json(results);
    } catch (err) {
        res.status(500).send("Search failed");
    }
});

// POST /orders
// Creates a new order in the database
app.post('/orders', async (req, res) => {
    try {
        const order = req.body;
        const result = await db.collection('orders').insertOne(order);
        res.status(201).json(result);
    } catch (err) {
        res.status(500).send("Failed to save order");
    }
});

// PUT /lessons/:id
// Updates the space count for a specific lesson
app.put('/lessons/:id', async (req, res) => {
    try {
        const id = new ObjectId(req.params.id);
        const newSpaces = req.body.spaces;

        await db.collection('lessons').updateOne(
            { _id: id },
            { $set: { spaces: newSpaces } }
        );
        res.json({ message: "Lesson updated successfully" });
    } catch (err) {
        res.status(500).send("Update failed");
    }
});

// Start server
const port = process.env.PORT || 3000; // Uses render port or port 300 if local
app.listen(port, () => {
    console.log(`Server active on port ${port}`);
    connectDB();
});