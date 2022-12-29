const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const pushAdapter = new FileSync('data/pushes.json')
const pushes = low(pushAdapter)
pushes.defaults({
    pushes: [],
}).write()

const postAdapter = new FileSync('data/posts.json')
const posts = low(postAdapter)
posts.defaults({
    posts: [],
}).write()

const userAdapter = new FileSync('data/users.json')
const users = low(userAdapter)
users.defaults({
    users: [],
}).write()


module.exports = {
    pushes,
    users,
    posts
}