const HttpError = require('../models/http-error');
const {validationResult} = require('express-validator');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');
const User = require('../models/user');
const mongoose = require('mongoose');

const getPlaceById = async(req, res, next)=>{
    
    const placeId = req.params.pid;
    let place;
    try{
        place = await Place.findById(placeId);
    } catch(err){
        return next(
            new HttpError('Something went wrong', 500)
        );
    }
    if(!place)
    {
        return next(
            new HttpError('Could not find place with given place ID', 404)
        );
    }

    res.json({place: place.toObject({getters: true}) });
};

const getPlacesByUserId = async(req, res, next) =>{
    const userId = req.params.uid;
    let places;
    try{
        places = await Place.find({creator: userId});
    } catch(err) {
        return next(
            new HttpError('Something went wrong', 500)
        );
    }
     
    if(!places || places.length===0)
    {
        return next(
            new HttpError('Could not find places with given user ID', 404)
        );
    }

    res.json({places: places.map(place => place.toObject({getters: true})) });
};

const createPlace = async(req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        return next(
            new HttpError('Data Wrong',422)
        );
    }
    const {title, description, address} = req.body;
    let coordinates
    try{
        coordinates = await getCoordsForAddress(address);
    }catch(error){
        return next(error);
    }
    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        image: req.file.path,
        creator: req.userData.userId
    });

    let user;
    try{
        user = await User.findById(req.userData.userId);
    } catch(err){
        return next(
            new HttpError('Creating place failed', 500)
        );
    }

    if(!user)
    {
        return next(
            new HttpError('User not found', 404)
        );
    }

    try{
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({session : sess});
        user.places.push(createdPlace); 
        await user.save({session: sess});
        await sess.commitTransaction();
    } catch(err){
        return next(
            new HttpError('Creating place failed', 500)
        );
    }
    res.status(201).json({place: createdPlace});
};

const updatePlaceById = async(req, res, next) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        return next(
            new HttpError('Data Wrong',422)
        );
    }
    const {title, description} = req.body;
    const placeId = req.params.pid;
    
    let place;
    try{
        place = await Place.findById(placeId);
    } catch(err){
        return next(
            new HttpError('Something went wrong', 500)
        );
    }

    if(place.creator.toString() !== req.userData.userId){
        return next(
            new HttpError('You are not allowed', 401)
        );
    }

    place.title=title;
    place.description=description;
    
    try{
        await place.save();
    } catch(err)
    {
        return next(
            new HttpError('Something went wrong',500)
        );
    }

    res.status(200).json({place: place.toObject({getters: true}) });
};

const deletePlace = async(req, res, next) =>{
    const placeId = req.params.pid;
    let place;
    try{
        place = await Place.findById(placeId).populate('creator');
    } catch(err){
        return next(
            new HttpError('Something went wrong', 500)
        );
    }
    if(!place)
    {
        return next(
            new HttpError('Could not find place with given place ID', 404)
        );
    }

    if(place.creator.id !== req.userData.userId)
    {
        return next(
            new HttpError('You are not allowed', 401)
        );
    }

    const imagePath = place.image;
    try{
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await place.remove({session: sess});
        place.creator.places.pull(place);
        await place.creator.save({session: sess});
        await sess.commitTransaction();
    } catch(err){
        return next(
            new HttpError('Something went wrong', 500)
        );
    }

    false.unlink(imagePath, err => {
        console.log(err);
    });

    res.status(200).json({message: 'DELETED PLACE'});
};

exports.updatePlaceById = updatePlaceById;
exports.deletePlace = deletePlace;
exports.createPlace = createPlace;
exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;