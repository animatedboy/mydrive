require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.DB_URI;
console.log(uri);
const dbClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function connectDB() {
    try {
        await dbClient.connect();
        let db = await dbClient.db(process.env.DB_NAME);
        db.command({ ping: 1 });
        console.log("Connected successfully to mongo server");
        // Create index
        await db.collection("users").createIndex({ email: 1 });
        await db.collection("files").createIndex({ folderId: 1,userId:1 });
        await db.collection("folders").createIndex({ userId: 1 });
        return db;
        // Init api
    } catch (e) {
        console.error(e);
    }
}

module.exports = {connectDB};