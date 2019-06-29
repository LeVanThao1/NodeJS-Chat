const { mongoose } = require('./index.js')
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        min: 3,
        max: 30,
        unique: true,
        // required: true
    },
    password: {
        type: String,
        min: 6,
        // required: true
    },
    email: {
        type: String,
        // required: true
    },
    facebook: {
        id: {
            type: String,
            max: 50
        } 
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        // required: true
    },
    geoPossition: {
        type: [Number]
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    deleteAt: {
        type: Date
    }   
}, { timestamps: true });
const User = mongoose.model('User', userSchema);
module.exports = User;