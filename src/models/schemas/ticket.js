import mongoose from "mongoose";

const ticketCollection = "ticket"

let today = new Date()

const ticketSchema = new mongoose.Schema({
    code: {
        type: String,
        unique: true
    },
    purchase_datetime:{
        type: Date,
        default: new Date().toLocaleTimeString()
    },
    amount: {
        type: Number,
        default: 1
    },
    purchaser:{
        type : String
    }
})

const ticketModel = mongoose.model(ticketCollection, ticketSchema)

export default ticketModel