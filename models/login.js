let mongoose = require('mongoose')


let loginschema = new mongoose.Schema({
    name: {
        type: String
    },email: {
        type: String
    }, password: {
        type: String
    }
})

module.exports = mongoose.model('login', loginschema)