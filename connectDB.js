const { mongoose } = require('mongoose')

const connectDB = async () => {
    try {
        const x = await mongoose.connect('mongodb+srv://User1:C1Y1FCRG3Bja5wX8@clusterdouglas.vgdrqt1.mongodb.net/?retryWrites=true&w=majority')
        console.log('Connected to db');
        mongoose.connection.db.dropDatabase();
        console.log("Dropped db");
    } catch (error) {
        console.log('db error');
    }
}

module.exports = { connectDB }