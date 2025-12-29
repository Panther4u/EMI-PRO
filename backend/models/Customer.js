const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phoneNo: { type: String, required: true },
    aadharNo: { type: String },
    address: { type: String },
    imei1: { type: String, required: true, unique: true },
    imei2: { type: String },
    mobileModel: { type: String },
    deviceName: { type: String },
    financeName: { type: String },
    totalAmount: { type: Number },
    emiAmount: { type: Number },
    emiDate: { type: Number },
    totalEmis: { type: Number },
    paidEmis: { type: Number },
    isLocked: { type: Boolean, default: false },
    location: {
        lat: { type: Number },
        lng: { type: Number },
        lastUpdated: { type: String },
        address: { type: String }
    },
    createdAt: { type: String },
    lockHistory: [{
        id: { type: String },
        action: { type: String, enum: ['locked', 'unlocked'] },
        timestamp: { type: String },
        reason: { type: String }
    }],
    photoUrl: { type: String },
    documents: [String],
    isEnrolled: { type: Boolean, default: false },
    enrollmentToken: { type: String },
    isVerified: { type: Boolean, default: false },

    // Advanced Controls
    networkRestricted: { type: Boolean, default: false },
    wifiRestricted: { type: Boolean, default: false },
    cameraRestricted: { type: Boolean, default: false },
    callsRestricted: { type: Boolean, default: false },
    messagesRestricted: { type: Boolean, default: false },
    notificationsRestricted: { type: Boolean, default: false },
    powerOffRestricted: { type: Boolean, default: false },
    resetRestricted: { type: Boolean, default: false },
    pinChangeRestricted: { type: Boolean, default: false },
    factoryResetRestricted: { type: Boolean, default: false },
    locationRestricted: { type: Boolean, default: false },
    emailRestricted: { type: Boolean, default: false },
    airplaneModeRestricted: { type: Boolean, default: false },
    withoutNetworkRestricted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Customer', CustomerSchema);
