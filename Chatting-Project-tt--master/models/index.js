//destructuring  pha vo
const mongoose = require('mongoose');
module.exports = {
    mongoose,
    connectDB: () => {
        return mongoose.connect('mongodb://localhost/hello-server', { useNewUrlParser: true,useFindAndModify: false,
        useCreateIndex: true });
    }
}