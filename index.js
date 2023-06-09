const express = require('express');
const app = express();
const cors = require("cors");
require('dotenv').config()
const port = process.env.PORT || 5000;


// middleware

app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mimqwr5.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const classCollection = client.db("fitLabDB").collection("class");
    const instructorsCollection = client.db("fitLabDB").collection("instructors");

    app.get('/class', async(req, res)=>{
        const result = await classCollection.find().toArray();
        res.send(result);
    })
    app.get('/popularClass', async(req, res)=>{
        const query = {};
        const options = {
            // sort matched documents in descending order by rating
            sort: { "studentsEnrolled": -1 },
            
          };
        const result = await classCollection.find(query, options).limit(6).toArray();
        res.send(result);
    })
    app.get('/instructors', async(req, res)=>{
        const result = await instructorsCollection.find().toArray();
        res.send(result);
    })
  




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);







app.get('/', (req, res)=>{
    res.send('FitLabLC on going')
})


app.listen(port, ()=>{
    console.log(`FitLabLC is setting on port ${port}`)
})