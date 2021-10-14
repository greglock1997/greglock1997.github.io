// Include Mongoose
var mongoose = require('mongoose');

// Define Schema
var Schema = mongoose.Schema;

var messageSchema = new Schema({
    username : {
        type : String,
        required : true
    },
    text : {
        type: String,
        required: true,
    }
})

var Message = mongoose.model('Message', messageSchema);

module.exports = Message;