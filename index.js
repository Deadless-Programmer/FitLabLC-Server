const express = require('express');
const app = express();
const cors = require("cors");
const jwt = require('jsonwebtoken');
require('dotenv').config()
const port = process.env.PORT || 5000;


// middleware

app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const userCollection = client.db("fitLabDB").collection("user");
    const classCollection = client.db("fitLabDB").collection("class");
    const instructorsCollection = client.db("fitLabDB").collection("instructors");
    const classCartCollection = client.db("fitLabDB").collection("classCart");


    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: '1h' })

      res.send({ token })
    })


    app.get('/user', async(req, res)=>{
      const result = await userCollection.find().toArray();
      res.send(result);
    })
    app.post('/user', async(req, res)=>{
      const user = req.body;
      const query = { email: user.email }
      const existingUser = await userCollection.findOne(query);
      console.log( "existing user", existingUser);
      if (existingUser) {
        return res.send({ message: 'user already exists' })
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    })
    app.patch('/user/admin/:id', async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'admin'
        },
      };

      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);

    })


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
  
    app.get('/popularInstructors', async(req, res)=>{
        const query = {};
        const options = {
            // sort matched documents in descending order by rating
            sort: { "studentsInClass": -1 },
            
          };
        const result = await instructorsCollection.find(query,options ).limit(6).toArray();
        res.send(result);
    })

    app.get('/classCart', async (req, res) => {
      const email = req.query.email;

      if (!email) {
        res.send([]);
      }

      // const decodedEmail = req.decoded.email;
      // if (email !== decodedEmail) {
      //   return res.status(403).send({ error: true, message: 'forbidden access' })
      // }

      const query = { email: email };
      const result = await classCartCollection.find(query).toArray();
      res.send(result);
    });


    app.post('/classCart', async (req, res)=>{
      const item =req.body;
      console.log(item);
      const result = await classCartCollection.insertOne(item);
      res.send(result);
    })

    app.delete('/classCart/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await classCartCollection.deleteOne(query);
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