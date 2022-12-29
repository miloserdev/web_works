const express = require('express')

const errors = require('./errors')
const crypto = require('./crypto')

const models = require('./models')

var router = express.Router();

router.get("/news", async (req, res, next) => {
    try {
        /* Получение параметров запроса */
        let id = req.params.id
        console.log(id)

        /* Проверка пользователя на корректность */

        let postData = await models.Post.findByLink(id)

        /* Отправка ответа */
        res.json({
            response: postData
        })

    } catch (error) {
        res.status(500).json({
            error: error.message
        })
        /* next(error.message) */
    }
})

router.get("/:id", async (req, res, next) => {
    try {
        /* Получение параметров запроса */
        let id = req.params.id
        console.log(id)

        /* Проверка пользователя на корректность */

        let postData = await models.Post.findByLink(id)

        /* Отправка ответа */
        res.json({
            response: postData
        })

    } catch (error) {
        res.status(500).json({
            error: error.message
        })
        /* next(error.message) */
    }
})

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = router