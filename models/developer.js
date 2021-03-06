const mongoose = require('mongoose')
const Game = require('./game')

const developerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        type: String
    },
    established: {
        type: Number,
        required: true 
    }
})

developerSchema.pre('remove', function(next) {
    Game.find({ developer: this.id }, (err, games) => {
        if (err) {
            next(err)
        } else if (games.length > 0) {
            next(new Error('This developer still has games'))
        } else {
            next()
        }
    })
})

module.exports = mongoose.model('Developer', developerSchema)