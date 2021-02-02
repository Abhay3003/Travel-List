const express = require('express');
const bodyParser = require('body-parser');
const HttpError = require('./models/http-error');
const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const mongoose = require('mongoose');
const app = express();
const fs = require('fs');
//path module built in node
const path = require('path')
app.use(bodyParser.json());

//static returns a file (no execution)
app.use('/uploads/images', express.static(path.join('uploads', 'images')))

app.use((req, res, next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next();
});

app.use('/api/places',placesRoutes);
app.use('/api/users', usersRoutes);

app.use((req, res, next)=>{
    return next(
        new HttpError('Could not find this route',404)
    );
});

app.use((error, req, res, next) => {
    //multer adds file prop
    if(req.file)
    {
        fs.unlink(req.file.path, ()=>{
            console.log(err);
        });
    }                            
    if(res.headerSent)
        return next(error);
    res.status(error.code || 500);
    res.json({message: error.message || 'An unknown error occurred'});
});

mongoose.
    connect('mongodb+srv://smaug:cXptAe9acjvvN1DD@cluster0.ukwbk.mongodb.net/mern?retryWrites=true&w=majority')
    .then(() => {
        app.listen(5000);
    })
    .catch(err=>{
        console.log(error);
    });