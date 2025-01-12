const bcrypt = require('bcrypt');
const readline = require('node:readline');
const { stdin: input, stdout: output } = require('node:process');

const rl = readline.createInterface({ input, output });
const saltRounds = 8;

const askQuestion = (question) => {
    return new Promise((resolve, reject) => {
        rl.question(question, resolve);
    });
}


const main = async () => {
    const displayName = await askQuestion("Enter Display Name? ");
    const username = await askQuestion("Enter username? ");
    const roles = await askQuestion("Enter roles as a comma delimited list. \nExample for Superuser: user,admin,super\nExample for admin user: user,admin\nExample for regular user: user)\nRoles: ");
    const password = await askQuestion("Enter password? ");
    console.log({displayName, username, roles, password});
}

main().finally(() => {
    process.exit();
});



// rl.question('Enter the password: ', (rawPassword) => {
//
//     const hashedPassword = bcrypt.hash(rawPassword, saltRounds).then(hashedPassword => {
//         console.log("hashedPassword: ", hashedPassword);
//     }).catch(err => {
//         console.error("Error: ", err);
//     });
//
//     rl.close();
// });





