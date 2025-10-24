import mongoose from 'mongoose'

const listing_schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    //this variable actually represents the manufacturer. ignore the fact its called cost please
    cost: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    image: {
        data: Buffer,
        contentType: String,
    },
    //expiration date for warranty
    expiresAt: {
        type: Date,
        required: false,
    },
    //for user uploaded receipts and attachments
    attachmentUrl: {
        type: String,
        required: false,
    },
    // parent listing for grouping multiple warranties under one item
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
        required: false,
    },
    // item photo url
    itemImageUrl: {
        type: String,
        required: false,
    },
}, {timestamps: true}
)

const Listing = mongoose.model('Listing', listing_schema);

export default Listing;
