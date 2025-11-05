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
        db = client.db("school-app");
        console.log("Connected to MongoDB!");
    } catch (err) {
        console.error("Failed to connect to MongoDB", err);
        process.exit(1);
    }
}

const port = 3000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    connectDB();
});
