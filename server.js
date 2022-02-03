// Import dependencies modules:
const express = require('express')
// const bodyParser = require('body-parser')


// Create an Express.js instance:
const app = express()

// config Express.js
app.use(express.json())
app.set('port', 3000)
app.use ((req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Headers","*");
    next();
})

// connect to MongoDB
const MongoClient = require('mongodb').MongoClient;
let db;
MongoClient.connect('mongodb+srv://MyMongoDBUser:wednesday@cluster0.epqbr.mongodb.net', (err, client) => {
    db = client.db('webstore')
})


// dispaly a message for root path to show that API is working
app.get('/', (req, res, next) => {
    res.send('Select a collection, e.g., /collection/messages')
})

// get the collection name
app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName)
    // console.log('collection name:', req.collection)
    return next()
})

// retrieve all the objects from an collection
app.get('/collection/:collectionName', (req, res, next) => {
    req.collection.find({}).toArray((e, results) => {
        if (e) return next(e)
        res.send(results)
    })
})

//adding post
app.post('/collection/:collectionName', (req, res, next) => {
req.collection.insert(req.body, (e, results) => {
if (e) return next(e)
res.send(results.ops)
})
})

// return with object id 

const ObjectID = require('mongodb').ObjectID;
app.get('/collection/:collectionName/:id'
, (req, res, next) => {
req.collection.findOne({ _id: new ObjectID(req.params.id) }, (e, result) => {
if (e) return next(e)
res.send(result)
})
})


//update an object 

app.put('/collection/:collectionName/:id', (req, res, next) => {
req.collection.update(
{_id: new ObjectID(req.params.id)},
{$set: req.body},
{safe: true, multi: false},
(e, result) => {
if (e) return next(e)
res.send((result.result.n === 1) ? {msg: 'success'} : {msg: 'error'})
})
})





app.delete('/collection/:collectionName/:id', (req, res, next) => {
req.collection.deleteOne(
{ _id: ObjectID(req.params.id) },(e, result) => {
if (e) return next(e)
res.send((result.result.n === 1) ?
{msg: 'success'} : {msg: 'error'})
})
})


// PUT route to reduce value of specified attribute of the record in database
app.put('/collection/:collectionName/:id/reduce/:name/:value', (req, res, next) => {

    let value = -1 * parseInt(req.params.value);
    let name = req.params.name;

    const attr = {};
    attr[name] = value;

    req.collection.updateOne(
        { _id: new ObjectID(req.params.id) },
        { "$inc": attr },
        { safe: true, multi: false },
        (e, result) => {
            if(e || result.result.n !== 1) return next();
            res.json({ message: 'success' });
        });
});




const port = process.env.PORT || 3000;
app.listen(port,()=> {console.log('express server is runnimg at localhost:3000')
})