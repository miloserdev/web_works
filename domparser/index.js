const fs = require('fs')

const express = require('express');
const app = express();
const compression = require('compression')


const DomParser = require('./data/dom')
const StyleSheet = require('./data/dom').StyleSheet


app.use(compression());


const title = "DomParser"
const host = "localhost"
const port = 8082

const headStyle = StyleSheet({
    display: 'flex',
    width: 100,
    height: 100
})

const bodyStyle = StyleSheet({
    display: 'flex',
    'flex-direction': 'column',
    width: '100%',
    height: '100%',
    'background-color': 'pink'
})

const block1 = `
    <block1>Block 1</block1>
`

app.get('/', (req, res, next) => {

    var html = DomParser.openSPR('home.spr')
    var values = { headStyle, bodyStyle, title, block1 }
    var someHTML = DomParser.parse(html, values).raw
    /* console.log(someHTML) */

    res.end(someHTML);
});

const server = app.listen(port, () => {
    console.log('App listening at http://%s:%s', host, port);
});
