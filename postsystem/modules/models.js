const crypto = require('./crypto')
const errors = require('./errors')

const db = require('./db')

const User = {
    get: async function (login) {
        let user = db.users.get('users').find({
            id: login
        }).value()
        if (!user) {
            throw Error(errors.usernotexist)
        }
        return user
    },

    getPublic: async function (login) {
        let user = await this.get(login)
        let data = {
            id: user.id,
            name: user.id,
            role: user.role
        }
        return data
    },

    isExist: async function (login) {
        let user = await this.get(login)
        return user ? true : false
    },

    loginByToken: async function (token) {
        let user = db.users.get('users').find({
            token: token
        }).value()
        if (!user) {
            throw Error(errors.tokenexpire)
        }
        return user
    },

    loginByLoginAndPassword: async function (login, password) {
        let user = db.users.get('users').find({
            id: login
        }).value()
        if (!user) {
            throw Error(errors.incorrectuser)
        }

        let passEquals = await crypto.checkHashPass(password, user.password).then(e => {
            return e
        })
        if (!passEquals) {
            throw Error(errors.incorrectpass)
        }

        return user
    },

    register: async function (login, password) {
        let ifUserExist = await this.isExist(login) /* db.users.get('users').some(user => user.id === login).value() */
        if (await ifUserExist) {
            throw Error(errors.userexists)
        }

        let pass = await crypto.hashPass(password)
        let data = {
            id: login,
            password: pass,
            token: crypto.generate_token_v2(256)
        }
        db.users.get('users').push(data).write()
        return data
    }
}

/* class PPost {
    constructor(title, raw, timestamp, author) {
        this.title = title
        this.raw = raw
        this.timestamp = timestamp
        this.author = author
    }
} */

const Post = {
    get: async function (id) {
        let post = db.posts.get('posts').find({
            id: id
        }).value()
        if (!post) {
            throw Error("No post")
        }
        return post
    },
    
    findByLink: async function (randoms) {
        let post = await db.posts.get('posts').find({
            link: randoms
        }).value()
        if (!post) {
            throw Error("No post")
        }
        return post
    },

    getAll: async function (offset = 0, max = 10) {
        let posts = db.posts.get('posts').slice((0 + offset), (max + offset)).value()
        if (!posts) {
            throw Error("Newsfeed is empty")
        }
        return posts
    },

    create: async function (title, raw, id) {

        if (!raw) {
            throw Error(errors.noparams)
        }
        if (!title | title.length <= 0) {
            title = this._getWords(raw)
        }
        
        let linked = String(title).replace(/^\s+|\s+$/g, '').replace(/[^a-z 0-9]/gi, '').replace(/ /gi, '-').toLowerCase()

        let ts = Math.round((new Date()).getTime() / 1000)
        
        let postData = {
            id: await this._getSize() + 1,
            type: "post",
            title: `${title}...`,
            raw: raw,
            author: id,
            time: ts,
            link: linked,
            random: crypto.generate_token(10)
        }
        db.posts.get('posts').push(postData).write()
        return postData
    },

    find: async function (text) {
        let ifUserExist = db.posts.get('users').some(post => post.id === id).value()
        if (ifUserExist) {
            throw Errors.userexists
        }

        let pass = await crypto.hashPass(password)
        let newToken = crypto.generate_token_v2(256)
        db.users.get('users').push({
            id: login,
            password: pass,
            token: newToken
        }).write()
        res.json({
            response: {
                'response': "Registered",
                token: newToken
            }
        })
    },

    delete: async function (login, password) {
        let user = db.posts.get('posts').find({
            id: login
        }).value()
        if (!user) {
            throw Errors.nouser
        }

        let passEquals = await crypto.checkHashPass(password, user.password).then(e => {
            return e
        })
        if (!passEquals) {
            throw Errors.someerror
        }

        return user
    },

    _getSize: async function () {
        let post = await db.posts.get('posts').size().value()
        return post

    },

    _getWords: function (str) {
        return str.split(/\s+/).slice(0, 5).join(" ");
    }
}


/* class User {
    constructor() {
        this.users = db.users;
    }

    async get(login) {
        let user = this.users.get('users').find({ id: login }).value()
        if (!user) { throw Errors.nouser }
        return user
    }

    async loginByToken(token) {
        let user = this.users.get('users').find({ token: token }).value()
        if (!user) { throw Errors.tokenexpire }
        return user
    }

    async loginByLoginAndPassword(login, password) {
        let user = this.users.get('users').find({ id: login }).value()
        if (!user) { throw Errors.nouser }

        let passEquals = await crypto.checkHashPass(password, user.password).then(e => { return e })
        if (!passEquals) { throw Errors.someerror }

        return user
    }

    async register(login, password) {    
        let ifUserExist = this.users.get('users').some(user => user.id === login).value()
        if (ifUserExist) { throw Errors.userexists }
    
        let pass = await crypto.hashPass(password)
        let newToken = crypto.generate_token_v2(256)
        this.users.get('users').push({ id: login, password: pass, token: newToken }).write()
        res.json({ response: { 'response': "Registered", token: newToken } })
    }
} */

module.exports = {
    User,
    Post
}