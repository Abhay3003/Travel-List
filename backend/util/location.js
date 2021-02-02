const axios = require('axios');
const HttpError = require('../models/http-error');
const API_KEY = 'AIzaSyAfScbt_TgMCMOr6DIUm5bWWisjl48_oX4';

async function getCoordsForAddress (address) {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`);
    const data = response.data;

    if(!data || data.status === 'ZERO_RESULTS'){
        const error = new HttpError('Could find location for address', 422);
        throw error;
    }

    const coordinates = data.results[0].geometry.location;
    return coordinates;
}

module.exports = getCoordsForAddress;