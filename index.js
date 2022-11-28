const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

app.use(cors())
app.use(express.json())

app.get('/', async (req, res) => {
    res.send('buysell portal server is running')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cwkrobe.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const CategoryList = client.db('BuySell').collection('CategoryList')
        const CategoryItems = client.db('BuySell').collection('CategoryItems')
        const usersCollection = client.db('BuySell').collection('usersCollection')
        const BookedCollection = client.db('BuySell').collection('BookedCollection')


        app.get('/categorylist', async (req, res) => {
            const query = {}
            const result = await CategoryList.find(query).toArray()
            res.send(result);
        })

        app.get('/category/:id', async (req, res) => {
            const id = req.params.id;
            const query = { categoryId: id }
            const result = await CategoryItems.find(query).toArray()
            res.send(result)
        })

        //
        app.get('/products', async (req, res) => {
            const query = {}
            const result = await CategoryItems.find(query).toArray()
            res.send(result)
        })

        //reported item
        app.get('/reportedProducts', async (req, res) => {
            const query = { isReported: true }
            const result = await CategoryItems.find(query).toArray()
            res.send(result)
        })

        //report product
        app.put("/reportedProducts/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const option = { upsert: true };
            const updatedDoc = {
                $set: {
                    isReported: true
                }
            }
            const result = await CategoryItems.updateOne(filter, updatedDoc, option);
            res.send(result);
        })

        app.patch("/reportedProducts/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const updatedDoc = {
                $set: {
                    isReported: false
                }
            }
            const result = await CategoryItems.updateOne(filter, updatedDoc);
            res.send(result);
        })





        app.get('/bookedList', async (req, res) => {
            let query = {}
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const result = await BookedCollection.find(query).toArray()
            res.send(result)
        })


        app.get('/users', async (req, res) => {
            let query = {}
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const result = await usersCollection.find(query).toArray()
            res.send(result)
        })


        app.get('/myproducts', async (req, res) => {
            let query = {}
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const result = await CategoryItems.find(query).toArray()
            res.send(result)
        })

        //verify user
        app.put('/seller/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    verified: true
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options)
            res.send(result)
        })



        //Advertise Handle API
        app.put('/myproducts/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    Advertise: true,
                    verified: true
                }
            }
            const result = await CategoryItems.updateOne(filter, updatedDoc, options)
            res.send(result)
        })

        //Available handle api
        app.put('/available/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    Available: true
                }
            }
            const result = await CategoryItems.updateOne(filter, updatedDoc, options)
            res.send(result)
        })













        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await CategoryItems.deleteOne(query)
            console.log(result)
            res.send(result)
        })



        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id
            let query = { _id: ObjectId(id) }
            const result = await usersCollection.deleteOne(query)
            res.send(result)
        })



        app.post('/categoryitems', async (req, res) => {
            const user = req.body;
            const result = await CategoryItems.insertOne(user)
            res.send(result)
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user)
            res.send(result)
        })

        app.post('/bookedList', async (req, res) => {
            const user = req.body;
            const result = await BookedCollection.insertOne(user)
            res.send(result)
        })



    } catch (error) {
        console.log(error);
    }
}


run().catch(console.log)





app.listen(port, () => console.log(`buy sell portal is running on ${port}`))