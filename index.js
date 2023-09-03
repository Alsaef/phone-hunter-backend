const express = require('express')
const app = express()
const port = process.env.PORT || 3000
var cors = require('cors')
require('dotenv').config()
var jwt = require('jsonwebtoken');
app.use(cors())
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
app.use(express.json())





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.SECRET_KEY}@cluster0.hwuf8vx.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const verifyJWT=(req,res,next)=>{
  console.log("server Hetting")
  const authorize=req.headers.authorize;
  if (!authorize) {
    res.status(401).send({error: true , message:"unauthorize access"})
  }
  const token=authorize.split(' ')[1]
  console.log(token)
  jwt.verify(token,process.env.USER_KEY,(error,decode)=>{
    if (error) {
      res.status(401).send({error: true , message:"unauthorize access"})
    }
    req.decode=decode;
    next()
  })
}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)

    app.post('/jwt',(req,res)=>{
      const user=req.body;
      const token=jwt.sign(user,process.env.USER_KEY,{
        expiresIn:"24h"
      })
      console.log(token)
      res.send({token})
    })
    await client.connect();
    const database = client.db("PhoneDB");
    const Phones = database.collection("Phones");
    const Orders = database.collection("orders");

  app.get('/phones',async(req,res)=>{
    const result = await Phones.find().toArray();
    res.send(result)

  })

  app.get('/phones/:id',async(req,res)=>{
          const id = req.params.id;
          const query = { _id: new ObjectId(id) };
          const result=await Phones.findOne(query)
          res.send(result)
  })

  app.post('/orders',async(req,res)=>{
        const order=req.body
        const result = await Orders.insertOne(order);
        res.send(result)
  })

  app.get('/orders',verifyJWT,async(req,res)=>{
    let query = {};
    if (req.query?.email) {
      query = { email: req.query.email }
    }
    app.delete('/orders/:id',async(req,res)=>{
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result=await Orders.deleteOne(query)
      res.send(result)
    })
  //  console.log(req.headers.authorize)
    const result = await Orders.find(query).toArray();
    res.send(result)
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





app.get('/', (req, res) => {
  res.send('Server Running!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})