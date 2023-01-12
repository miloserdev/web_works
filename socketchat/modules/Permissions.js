default_perm = 'user'

const Permissions = () => {}

Permissions.groups = {
    0: default_perm,
    1: 'moderator',
    2: 'admin',
    3: 'sysadmin',
    4: 'root'
}
Permissions.users = {
    'Max': 0,
    'Miloserdev': 4
}
Permissions.get = (user) => Permissions.groups[Permissions.users[user]] || default_perm
Permissions.id = (user) => Permissions.users[user] || 0

module.exports = Permissions