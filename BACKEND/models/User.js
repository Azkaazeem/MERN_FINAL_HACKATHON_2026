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
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            minlength: 6
        },
        role: {
            type: String,
            enum: ['user', 'admin', 'administrator', 'customer', 'worker', 'agent'],
            default: 'customer'
        },
        dob: {
            type: String,
            default: ''
        },
        department: {
            type: String,
            default: 'General Civic Support'
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

// Pre-save hook: Hash password if modified and not already hashed
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    
    // Avoid double-hashing if already a bcrypt hash
    if (
        this.password &&
        (this.password.startsWith('$2a$') ||
         this.password.startsWith('$2b$') ||
         this.password.startsWith('$2y$'))
    ) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password supporting both bcrypt hash and plain text fallback
userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!enteredPassword || !this.password) return false;
    
    if (
        this.password.startsWith('$2a$') ||
        this.password.startsWith('$2b$') ||
        this.password.startsWith('$2y$')
    ) {
        return await bcrypt.compare(enteredPassword, this.password);
    }
    
    return enteredPassword === this.password;
};

module.exports = mongoose.model('User', userSchema);
