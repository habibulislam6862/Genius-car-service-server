const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config()

const app = express();
const port = process.env.PORT || 8000;


// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dd4rb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const database = client.db("geniusCar");
        const geniusCar = database.collection("service");
        
        // post service
        app.post('/service/post', async (req, res) => {
            const service = req.body;
            const result = await geniusCar.insertOne(service);
            res.json(result);
        })

        // get all services
        app.get('/services', async (req, res) => {
            const limit = parseInt(req.query.limit);
            const page = parseInt(req.query.page);
            const query = {};
            const count = await geniusCar.find(query).count();


            const options = {
                limit,
                skip: page*limit
            };
           
            const cursor = geniusCar.find(query, options);
            const result  = await cursor.toArray();
            res.json({count, services: result});
        })

        // get single service
        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id)};
            const service = await geniusCar.findOne(query);
            res.json(service);
        })

        // edit service
        app.put('/service/put/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const updateService = {
                $set: req.body,
              };
            const result = await geniusCar.updateOne(filter, updateService);
            res.json(result);
        })

        // delete service 
        app.delete('/service/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await geniusCar.deleteOne(query);
            if (result.deletedCount === 1) {
                res.json(result)
              } else {
                res.json({deletedCount: 0})
              }
        })
    } finally {
        // await client.close();
    }
}

run().catch(() => console.dir())


app.listen(port, () => {
    console.log(`Liver server: http://localhost:${port}`);
});