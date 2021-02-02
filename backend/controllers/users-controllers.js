const HttpError = require('../models/http-error');
const {validationResult} = require('express-validator');
const User = require('../models/user')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const getUsers = async(req, res, next) => {
    let users;
    try{
        users = await User.find({},'-password');
    }catch(err){
        return next(
            new HttpError('Failed',500)
        );
    }
    res.json({users: users.map(user=>user.toObject({getters: true}) )})
};

const signup = async(req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        return next(
            new HttpError('Invalid input/s',422)
        );
    }

    const {name, email, password} = req.body;
    let existingUser;
    try{
        existingUser = await User.findOne({email: email})
    } catch(err)
    {
        return next(
            new HttpError('Something went wrong', 500)
        );
    }
    if(existingUser)
    {
        return next(
            new HttpError('User exists',422)
        );
    }

    let hashedPassword;
    try{
        hashedPassword = await bcrypt.hash(password, 12);
    }catch(err)
    {
        return next(
            new HttpError('Could not create user, try again',500)
        );
    }

    const createdUser = new User({
        name,
        email,
        image: req.file.path,
        password: hashedPassword,
        places: [] 
    });
    try{
        await createdUser.save();
    } catch(err){
        return next(
            new HttpError('Creating user failed', 500)
        );
    }

    let token;
    try{
        token = jwt.sign(
            {userId: createdUser.id, email: createdUser.email},
            'supersecret_dont_share',
            {expiresIn: '1h'}
            )
    }catch(err){
        return next(
            new HttpError('Signingup failed',500)
        );
    }

    res.status(201).json({userId: createdUser.id, email: createdUser.email, token: token});

};

const login = async(req, res, next) => {
    const {email, password} = req.body;
    
    let existingUser;
    try{
        existingUser = await User.findOne({email: email})
    } catch(err)
    {
        return next(
            new HttpError('Something went wrong', 500)
        );
    }

    if(!existingUser)
    {
        return next(
            new HttpError('Invalid credentials', 401)
        );
    }

    let isValidPassword = false;
    try{
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    }catch(err)
    {
        return next(
            new HttpError('Wrong Password',500)
        );
    }

    if(!isValidPassword)
    {
        return next(
            new HttpError('Wrong Password',500)
        );
    }

    let token;
    try{
        token = jwt.sign(
            {userId: existingUser.id, email: existingUser.email},
            'supersecret_dont_share',
            {expiresIn: '1h'}
            )
    }catch(err){
        return next(
            new HttpError('Logging in failed',500)
        );
    }

    res.json({
        userId: existingUser.id,
        email: existingUser.email,
        token: token
    });
};

exports.getUsers = getUsers;
exports.login = login;
exports.signup = signup;