const url = require('url')
const socket = require('ws')
const wss = socket.Server({ port: 8080 })

const Auth = require('./modules/Auth')
const Permissions = require('./modules/Permissions')

global.wss = wss


wss.on('connection', (client) => {
    client.json = function (string) { this.send(JSON.stringify(string)) }
    json = (string) => JSON.stringify(string)

    let connection = new Connection(client)

    connection.socket.on('message', msg => {
        try {
            if (msg[0] == '/') {
                new Command(connection.getUser(), msg)
            } else {
                new ChatMessage(connection.getUser(), msg)
            }
        } catch (e) {
            console.log(e)
        }
    })

    connection.socket.on('close', event => {
        console.log(disconnect_message(connection.getUser().name))
    })

    connection.socket.on('disconnect', event => {
        console.log(disconnect_message(connection.getUser().name))
    })
})


class User {
    constructor(websocket, name, permission, permission_id, connection) {
        this.socket = websocket
        this.name = name
        this.permission = permission
        this.permission_id = permission_id
        this.connection = connection
    }

    getUser() { return this }
    getName() { return this.name }
    getPermission() { return this.permission }
    getGroup() { return this.permission }
    getPermissionId() { return this.permission_id }
    getConnection() { return this.connection }
}

class Connection {
    constructor(websocket) {
        this.socket = websocket
        this.user = this.createUser(websocket)
        this.protocol = websocket.protocol
        this.queries = websocket.queries
    }

    createUser(websocket) {
        let query = url.parse(websocket.upgradeReq.url, true).query
        let name = query.name

        let permission = Permissions.get(name)
        let permission_id = Permissions.id(name)

        if (String(name) == undefined) {
            let error = new Error('Name not required')
            this.disconnect(websocket, error)
            console.log(disconnect_message(name))
            //return
        } else {
            websocket.send('connected')
            console.log(connected_message(name))
        }

        return new User(websocket, name, permission, permission_id, this)
    }

    getUser() { return this.user }
    getSocket() { return this.socket }
    getProtocol() { return this.protocol }
    getQueries() { return this.queries }
    disconnect() { this.socket.terminate() }
}


const commands = {
    help: {
        permission: 0,
        description: 'Список команд',
        command: (user, msg, command) => {
            let list = `\n~Список команд\n/help - Список команд\n/online - Список коннектов на сервере\n/broadcast [message] - Броадкаст\n`
            user.socket.send(list)
        }
    },
    online: {
        permission: 2,
        description: 'Онлайн',
        command: (user, msg, command) => {
            let online = wss.clients.forEach(el => url.parse(el.upgradeReq.url, true).query.name)
            console.log(online)
            user.socket.send(online)
        }
    },
    broadcast: {
        permission: 4,
        description: '',
        command: (user, msg, command) => {
            broadcast(user.socket, msg.replace('/broadcast ', ''), true)
        }
    }
}


const Command = function (user, msg) {

    let format = `${user.name}@${user.permission} ˜ # ${msg}`
    console.log(format)

    let command = msg.substring(1).split(' ')
    command = commands[command[0]]

    if (command != undefined) {
        if (user.permission_id >= command.permission) {
            command.command(user, `root ˜ # >> ${msg}`, command)
        } else {
            user.socket.send('у вас нет прав на каст данной команды')
        }
    } else {
        user.socket.send('команда не распознана')
    }
}


const ChatMessage = function (user, msg) {
    let format = `${user.name}@${user.permission} ˜ # ${msg}`
    console.log(format)
    broadcast(user, format)
}


const broadcast = (_user, msg, includeme = false) => {
    wss.clients.filter(includeme ? u => u : u => u != _user.socket).forEach(user => {
        user.send(msg)
    })
}