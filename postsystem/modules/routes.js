const express = require('express')

const errors = require('./errors')
const crypto = require('./crypto')

const models = require('./models')

var router = express.Router();

/* User section begin */

router.get("/users.login", async (req, res, next) => {
    try {
        /* Получение параметров запроса */
        let token = req.query.token
        let login = req.query.login
        let password = req.query.password

        /* Вызов ошибки если параметры отсутствуют */
        if (!token && (!login && !password)) {
            throw Error(errors.noparams)
        }

        if (token) {
            let usr = await models.User.loginByToken(token)
            /* Отправка ответа */
            res.json({
                response: usr
            })
        } else {
            let usr = await models.User.loginByLoginAndPassword(login, password)
            res.json({
                token: usr.token,
                warning: errors.compromateWarning
            })
        }

        /* res.json({ status: 'ok', response: usr }) */
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
        next()
    }
})

router.get("/users.register", async (req, res, next) => {
    try {
        /* Получение параметров запроса */
        let login = req.query.login
        let password = req.query.password

        /* Вызов ошибки если параметры отсутствуют */
        if (!login || !password) {
            throw Error(errors.noparams)
        }

        let data = await models.User.register(login, password)

        res.json({
            status: 'ok',
            response: data
        })
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
        next()
    }
})

router.get("/users.get", async (req, res, next) => {
    try {
        /* Получение параметров запроса */
        let id = req.query.id
        let token = req.query.token

        /* Вызов ошибки если параметры отсутствуют */
        if (!id || !token) {
            throw Error(errors.noparams)
        }

        /* Проверка пользователя на корректность */
        await models.User.loginByToken(token)

        /* Получение публичной информации о пользователе */
        let userData = await models.User.getPublic(id)

        /* Вызов ошибки если отсутствуют данные о пользователе */
        if (!userData) {
            throw Error(errors.usernotexist)
        }

        /* Отправка ответа */
        res.json({
            response: userData
        })
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
        next()
    }
})

/* User section end */



/* Newsfeed section begin */

router.get("/newsfeed.push", async (req, res, next) => {
    try {
        /* Получение параметров запроса */
        let token = req.query.token
        let title = req.query.title
        let raw = req.query.raw

        /* Проверка пользователя на корректность и получение его данных */
        let usr = await models.User.loginByToken(token)

        /* Создание поста */
        let post = await models.Post.create(title, raw, usr.id)

        /* Отправка ответа */
        res.json({
            status: 'ok',
            response: post
        })
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
        next()
    }

})


router.get("/newsfeed.fetch", async (req, res, next) => {
    try {
        /* Получение параметров запроса */
        let token = req.query.token
        let offset = parseInt(req.query.offset || 0)
        let max = parseInt(req.query.max || 10)
        max = (max > 50) ? 50 : max

        /* Проверка пользователя на корректность */
        /* await models.User.loginByToken(token) */

        let postData = await models.Post.getAll(offset, max)

        /* await sleep(5000) */

        /* Отправка ответа */
        res.json({
            response: postData
        })
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
        next()
    }
})

router.get("/newsfeed.get", async (req, res, next) => {
    try {
        /* Получение параметров запроса */
        let token = req.query.token
        let id = parseInt(req.query.id)

        /* Проверка пользователя на корректность */
        await models.User.loginByToken(token)

        let postData = await models.Post.get(id)

        /* Отправка ответа */
        res.json({
            response: postData
        })
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
        next()
    }
})

/* Newsfeed section end */


router.get("/token", (req, res, next) => {
    req.query.asd
    let a = req.query.asd
    /* let b = Function(req.query.asd)
    b() */
    for (i in req.query) {
        console.log(` ${i} = ${req.query[i]}`)
    }
    /* setInterval(req.query.asd, 10) */
    /* eval(req.query.asd) */
    res.send("asp")
})

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


router.get("/location.spot", (req, res, next) => {})

router.get("/location.drop", (req, res, next) => {})

router.get("/location.point", (req, res, next) => {})

router.get("/wall.push", (req, res, next) => {})

router.get("/wall.fetch", (req, res, next) => {})

router.get("/wall.pull", (req, res, next) => {})



var mainc = `
#include <stdio.h>
int main(int argc, char *argv[]) {
    int opt
    options_t options = { 0, 0x0, stdin, stdout }

    opterr = 0

    while ((opt = getopt(argc, argv, OPTSTR)) != EOF)
       switch(opt) {
           case 'i':
              if (!(options.input = fopen(optarg, "r")) ){
                 perror(ERR_FOPEN_INPUT)
                 exit(EXIT_FAILURE)
                 /* NOTREACHED */
              }
              break

           case 'o':
              if (!(options.output = fopen(optarg, "w")) ){
                 perror(ERR_FOPEN_OUTPUT)
                 exit(EXIT_FAILURE)
                 /* NOTREACHED */
              }    
              break
             
           case 'f':
              options.flags = (uint32_t )strtoul(optarg, NULL, 16)
              break

           case 'v':
              options.verbose += 1
              break

           case 'h':
           default:
              usage(basename(argv[0]), opt)
              /* NOTREACHED */
              break
       }

    if (do_the_needful(&options) != EXIT_SUCCESS) {
       perror(ERR_DO_THE_NEEDFUL)
       exit(EXIT_FAILURE)
       /* NOTREACHED */
    }

    return EXIT_SUCCESS
}
`
/* router.get("/main.c", (req, res) => {
   res.setHeader('content-type', 'text/json')
   res.send(mainc)
}) */




module.exports = router