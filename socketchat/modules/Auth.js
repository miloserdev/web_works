global.trying_message = (ws) => `Попытка подключения ${ws._socket.server._connectionKey}`
global.connected_message = (name) => `Юзер ${name} подключился`
global.disconnect_message = (name) => `Юзер ${name} ливнул`