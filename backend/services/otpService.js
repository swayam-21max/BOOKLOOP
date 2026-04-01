const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * Generates a random 6-digit OTP.
 */
exports.generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

/**
 * Hashes an OTP for secure storage.
 */
exports.hashOTP = async (otp) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(otp, salt);
};

/**
 * Verifies a provided OTP against its hashed version.
 */
exports.verifyOTP = async (otp, hashedOTP) => {
    return await bcrypt.compare(otp, hashedOTP);
};

const emailService = require('./emailService');

/**
 * Sends the OTP via Email using the emailService.
 */
exports.sendOTP = async (email, otp) => {
    console.log(`\n--- [SENDING LOGIN LOGIN OTP] ---`);
    console.log(`To: ${email}`);
    console.log(`OTP: ${otp}`);
    console.log(`--------------------------\n`);
    
    return await emailService.sendOTP(email, otp);
};

