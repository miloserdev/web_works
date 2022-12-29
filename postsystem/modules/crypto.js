const bcrypt = require('bcrypt')

async function hashPass(password) {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, 10, async (err, hash) => {
            if (hash) {
                resolve(hash)
            } else {
                reject(err)
            }
        })
    })
}

async function checkHashPass(password, hash) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, hash, async (err, res) => {
            if (res) {
                resolve(res)
            } else {
                resolve(false)
            }
        })
    })
}

function generate_token(length) {
    //edit the token allowed characters
    let a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("")
    let b = []
    for (let i = 0; i < length; i++) {
        let j = (Math.random() * (a.length - 1)).toFixed(0)
        b[i] = a[j]
    }
    return b.join("")
}

function generate_token_v2(length) {
    //edit the token allowed characters
    let a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890.*&%$#@!".split("")
    let b = []
    for (let i = 0; i < length; i++) {
        let j = (Math.random() * (a.length - 1)).toFixed(0)
        b[i] = a[j]
    }
    return b.join("")
}

module.exports = {
    hashPass,
    checkHashPass,
    generate_token,
    generate_token_v2
}