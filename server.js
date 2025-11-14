const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const uri = "mongodb+srv://foyzur2005:Foyzur12@cluster0.lhuwfxq.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri);

let db;

async function connectDB() {
    try {
        await client.connect();
        db = client.db("school");
    } catch (err) {
        process.exit(1);
    }
}

app.use((req, res, next) => {
    console.log(`Request received: ${req.method} ${req.url}`);
    next();
});

app.use('/images', express.static('images'));

app.get('/lessons', async (req, res) => {
    try {
        if (!db) {
            return res.status(500).send("Database not connected");
        }
        const lessons = await db.collection('lessons').find({}).toArray();
        res.json(lessons);
    } catch (err) {
        console.error("Error fetching lessons:", err);
        res.status(500).send("Error fetching lessons");
    }
});

app.get('/search', async (req, res) => {
    try {
        if (!db) {
            return res.status(500).send("Database not connected");
        }

        const query = req.query.q || '';

        const searchQuery = {
            $or: [
                { subject: { $regex: query, $options: 'i' } },
                { location: { $regex: query, $options: 'i' } }
            ]
        };

        const lessons = await db.collection('lessons').find(searchQuery).toArray();
        res.json(lessons);

    } catch (err) {
        console.error("Error searching lessons:", err);
        res.status(500).send("Error searching lessons");
    }
});

app.post('/orders', async (req, res) => {
    try {
        const order = req.body;
        const result = await db.collection('orders').insertOne(order);
        res.status(201).json(result);
    } catch (err) {
        console.error("Error saving order:", err);
        res.status(500).send("Error saving order");
    }
});

app.put('/lessons/:id', async (req, res) => {
    try {
        const lessonId = new ObjectId(req.params.id);
        const newSpaces = req.body.spaces;

        const result = await db.collection('lessons').updateOne(
            { _id: lessonId },
            { $set: { spaces: newSpaces } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).send("Lesson not found");
        }
        
        res.json({ message: "Lesson spaces updated" });
    } catch (err) {
        console.error("Error updating lesson:", err);
        res.status(500).send("Error updating lesson");
    }
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    connectDB();
});