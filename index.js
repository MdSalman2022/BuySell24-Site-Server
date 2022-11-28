const express = require('express');
const cors = require('cors');

const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// const corsConfig = {
//     origin: 'https://buysell-a13b9.web.app/',
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
// }
// app.use(cors(corsConfig))
// app.options("", cors(corsConfig))


app.use(express.json())
app.use(cors())


app.get('/', async (req, res) => {
    res.send('buysell portal server is running')
})

// MONGODB  
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cwkrobe.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        //for all category and its item
        const CategoryList = client.db('BuySell').collection('CategoryList')
        const CategoryItems = client.db('BuySell').collection('CategoryItems')
        const usersCollection = client.db('BuySell').collection('usersCollection')
        const BookedCollection = client.db('BuySell').collection('BookedCollection')
        const paymentsCollection = client.db('BuySell').collection('paymentsCollection')

        // STRIPE
        app.post('/create-payment-intent', async (req, res) => {
            const booking = req.body
            const price = booking.price;
            const amount = price * 100

            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                "payment_method_types": [
                    "card"
                ],
            })
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        })

        app.post('/payments', async (req, res) => {
            const payment = req.body;
            const result = await paymentsCollection.insertOne(payment)
            const id = payment.bookingId
            const filter = { _id: ObjectId(id) }

            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId
                }
            }

            const updateResult = await paymentsCollection.updateOne(filter, updatedDoc)
            res.send(result)
        })


        app.get('/payments', async (req, res) => {
            const query = {}
            const booking = await paymentsCollection.find(query).toArray()
            res.send(booking)
        })


        // booking list 
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

        app.get('/bookedList/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const booking = await BookedCollection.findOne(query)
            res.send(booking)
        })


        app.post('/bookedList', async (req, res) => {
            const user = req.body;
            const result = await BookedCollection.insertOne(user)
            res.send(result)
        })


        // all products and category 
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



        //report product by id
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






        // get user info
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

        // seller my products api 
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
        app.patch('/available/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const updatedDoc = {
                $set: {
                    Available: false
                }
            }
            const result = await CategoryItems.updateOne(filter, updatedDoc)
            res.send(result)
        })



        // delete product api 
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await CategoryItems.deleteOne(query)
            console.log(result)
            res.send(result)
        })



        // delete user api 
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id
            let query = { _id: ObjectId(id) }
            const result = await usersCollection.deleteOne(query)
            res.send(result)
        })


        // add a product api 
        app.post('/categoryitems', async (req, res) => {
            const user = req.body;
            const result = await CategoryItems.insertOne(user)
            res.send(result)
        })

        // add a user api 
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user)
            res.send(result)
        })



    } catch (error) {
        console.log(error);
    }
}


run().catch(console.log)





app.listen(port, () => console.log(`buy sell portal is running on ${port}`))