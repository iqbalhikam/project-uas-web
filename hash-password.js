/* eslint-disable @typescript-eslint/no-require-imports */
// hash-password.js
const bcrypt = require('bcrypt');
const saltRounds = 10;
// Ganti 'admin123' dengan password yang Anda inginkan
const myPassword = 'admin123';

bcrypt.hash(myPassword, saltRounds, function (err, hash) {
    if (err) {
        console.error(err);
        return;
    }
    console.log("Password Anda:", myPassword);
    console.log("Hash untuk database:", hash);
});