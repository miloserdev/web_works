const noparams = 'Error one of parameters'
const userexists = 'User exists'
const nouser = 'No user'
const usernotexist = 'This guy does not exist'
const someerror = 'Some error'

const incorrectuser = 'Incorrect login'
const incorrectpass = 'Incorrect password'

const tokenexpire = 'Token does not exist or expire'

/* const noparams = (res) => { res.status(500).json({ status: 'error', message: 'Error one of parameters', }) }
const userexists = (res) => { res.status(500).json({ status: 'error', message: 'User exists', }) }
const nouser = (res) => { res.status(500).json({ status: 'error', message: 'No user', }) }
const someerror = (res) => { res.status(500).json({ status: 'error', message: 'Some error', }) }
const tokenexpire = (res) => { res.status(500).json({ status: 'error', message: 'Token does not exist or expire', }) } */

const compromateWarning = "Не передавайте эту информацию третьим лицам, в противном случае, ваш аккаунт может быть скомпромитирован"


module.exports = {
    noparams,
    userexists,
    nouser,
    usernotexist,
    someerror,
    incorrectuser,
    incorrectpass,
    tokenexpire,
    compromateWarning
}