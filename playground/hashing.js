const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

var password = '123abc!';

// bcrypt.genSalt(10, (err, salt) => {
//     bcrypt.hash(password, salt, (err, hash) => {
//         console.log(hash);
//     });
// });

var hashedPw = '$2a$10$10CiIxpHW9qPWn3D0jLDkeqFEVnaDniUlkEMo0bUheAbxbqa3oXpW';

bcrypt.compare(password, hashedPw, (err, res) => {
    console.log(res);
});
// var data = {
//     id : 10
// };

// var token = jwt.sign(data, '123abc');
// console.log(token);

// var decoded = jwt.verify(token, '123abc');
// console.log(`Decoded: ${JSON.stringify(decoded)}`);
// var msg = 'Test string';
// var hash = SHA256(msg).toString();

// console.log(`Message: ${msg}`);
// console.log(`Hash: ${hash}`);

// var data = {
//     id : 4
// };

// var token = {
//     data,
//     //salting -> adding a random string to the hash
//     hash : SHA256(JSON.stringify(data) + 'somesecret').toString()
// };

// // token.data.id = 5;
// // token.hash = SHA256(JSON.stringify(token.data)).toString();

// var resultHash = SHA256(JSON.stringify(token.data) + 'somesecret').toString();
// if (resultHash === token.hash) {
//     console.log('Data not changed');
// } else {
//     console.log('Data was changed. Deny entry.');
// }