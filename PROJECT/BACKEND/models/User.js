const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        password: {
            type: String,
            required: true,
            minlength: 6
        },
        role: {
            type: String,
            enum: ['user', 'admin', 'customer', 'worker'],
            default: 'customer'
        },
        dob: {
            type: String,
            default: ''
        },
        department: {
            type: String,
            default: 'General Civic'
        },
        profilePic: {
            type: String,
            default: ''
        },
        phone: {
            type: String,
            default: ''
        },
        karmaPoints: {
            type: Number,
            default: 120
        },
        verifiedReportsCount: {
            type: Number,
            default: 3
        },
        badge: {
            type: String,
            default: 'Civic Member'
        }
    },
    { timestamps: true }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
