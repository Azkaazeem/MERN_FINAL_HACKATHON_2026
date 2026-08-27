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
            required: function () {
                return this.authProvider === 'local';
            },
            minlength: 6
        },
        authProvider: {
            type: String,
            enum: ['local', 'google', 'github'],
            default: 'local'
        },
        googleId: {
            type: String
        },
        githubId: {
            type: String
        },
        dob: {
            type: String
        },
        cnic: {
            type: String
        },
        profilePic: {
            type: String,
            default: ''
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        }
    },
    { timestamps: true }
);

// SAVE PASSWORD BEFORE HASHING
userSchema.pre('save', async function () {
    if (!this.password || !this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// PASSWORD COMPARISON METHOD
userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);