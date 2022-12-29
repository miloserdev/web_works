
const fs = require('fs')
const path = require('path')

const http = require('http')
const express = require('express')
const helmet = require('helmet')
const compression = require('compression')
const { nextTick } = require('process')
const app = express()

const cl = require('./modules/cl')

/* app.use(compression())
app.use(helmet()) */

/* app.use(helmet.contentSecurityPolicy())
app.use(helmet.dnsPrefetchControl())
app.use(helmet.expectCt())
app.use(helmet.frameguard())
app.use(helmet.hidePoweredBy())
app.use(helmet.hsts())
app.use(helmet.ieNoOpen())
app.use(helmet.noSniff())
app.use(helmet.permittedCrossDomainPolicies())
app.use(helmet.referrerPolicy())
app.use(helmet.xssFilter())

app.use(function (req, res, next) {   
   res.setHeader('X-Powered-By', 'Skynet')
   res.setHeader('Server', 'Alaska VERnet DC')
   res.setHeader('main_class', 'main.c')

   res.setHeader('Connection', 'Protectied connection')
   next()
}) */

/* app.get('*', function (req, res) { res.status(404).json({ error: 'read api docs!' }) }) */
/* app.get("/", (req, res) => { res.json({ response: "Use fetch() with this api!" }) }) */



const logg = () => {
   return function logg(req, res, next) {
      let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
      cl.colorLog(`${new Date().toUTCString()}: | method: [${req.method}] | ip: [${ip}] | url: [${req.originalUrl}] | timeout: [${req.timeout}]`, 'warning')
      /* console.dir(req) */
      next()
   }
 }
 

app.use(logg())

app.use('/api', require('./modules/routes'))
app.use('/', require('./modules/newsfeed'))

app.use(express.static('C:/Users/Max/Desktop/dir/build'))



/* {
   "id": 1,
   "type": "post",
   "title": "Est elit do ex mollit irure veniam proident reprehenderit.",
   "raw": "<text><h1>Multoque hoc melius nos veriusque quam Stoici.</h1><dist onclick=\"document.documentElement.requestFullscreen();\"> <dp>login</dp> <sp>register</sp></dist><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Idem adhuc; Recte dicis; <mark>In schola desinis.</mark> <a href=\"http://asdasdasdasdasd.asd/\" target=\"_blank\">Quamquam te quidem video minime esse deterritum.</a> </p><h2>Quae cum essent dicta, discessimus.</h2><p>Tamen a proposito, inquam, aberramus. Quam si explicavisset, non tam haesitaret. <code>Duo Reges: constructio interrete.</code> <i>Cave putes quicquam esse verius.</i> </p><dl> <dt><dfn>Eam stabilem appellas.</dfn></dt> <dd>Nec vero sum nescius esse utilitatem in historia, non modo voluptatem.</dd> <dt><dfn>Nihilo magis.</dfn></dt> <dd>Graece donan, Latine voluptatem vocant.</dd></dl><gallery> <div><pullquote>Veniam commodo tempor.</pullquote><img src=\"./images2/pic2.jfif\"></div><div><pullquote>Voluptate culpa sunt elit esse.</pullquote><img src=\"./images2/pic3.jfif\"></div><div><pullquote>Nulla do aliquip nisi in elit enim.</pullquote><img src=\"./images2/pic4.jfif\"></div><div><pullquote>Nostrud aute veniam ipsum eiusmod minim.</pullquote><img src=\"./images2/apple2.jfif\"></div><div><pullquote>Cillum qui labore et duis ex aliquip.</pullquote><img src=\"./images2/apple3.jfif\"></div></gallery><p>Quae cum dixisset paulumque institisset, Quid est? Nunc omni virtuti vitium contrario nomine opponitur. <b>Illa tamen simplicia, vestra versuta.</b> Quis hoc dicit? </p><pre>Ita fit, ut duo genera propter se expetendorum reperiantur,unum, quod est in iis, in quibus completar illud extremum,quae sunt aut animi aut corporis;Eam si varietatem diceres, intellegerem, ut etiam nondicente te intellego;</pre><blockquote cite=\"http://loripsum.net\"> Studet enim meus is audire Cicero quaenam sit istius veteris, quam commemoras, Academiae de finibus bonorum Peripateticorumque sententia.</blockquote><ol> <title>Random title aaaaaaaaaa</title> <li><span>In omni enim arte vel studio vel quavis scientia vel in ipsa virtute optimum quidque rarissimum est. </span></li><li><span>Aliud igitur esse censet gaudere, aliud non dolere.</span></li><li><span>Qui non moveatur et offensione turpitudinis et comprobatione honestatis?</span></li><li><span>Qui ita affectus, beatum esse numquam probabis;</span></li><li><span>Quam ob rem tandem, inquit, non satisfacit?</span></li></ol><ul> <title>Random title brr</title> <li><span>Tum Piso: Quoniam igitur aliquid omnes, quid Lucius noster?</span></li><li><span>Quod cum ille dixisset et satis disputatum videretur, in oppidum ad Pomponium perreximus omnes.</span></li><li><span>Egone quaeris, inquit, quid sentiam?</span></li><li><span>Nec vero intermittunt aut admirationem earum rerum, quae sunt ab antiquis repertae, aut investigationem novarum.</span></li><li><span>Dic in quovis conventu te omnia facere, ne doleas.</span></li></ul></text>",
   "author": "admin",
   "time": 1597742636,
   "random": "HHiRWnM1fI"
 }, */


const HOST = process.env.HOST || '127.0.0.1'
const PORT = process.env.PORT || 3000

const title = " NodeJS Api"
const text = ` Api started at ${HOST}:${PORT}`
const startup = process.title.includes('nodemon') ? ' Debug mode' : ' Production mode'

const preview = `
┌─────────────────────────────────────┬───────────┐
│                                     │           │
│`      + title.padEnd(37) + `│           │
│                                     │     A     │
├─────────────────────────────────────┤     P     │
│                                     │     I     │
│`      + text.padEnd(37) + `│           │
│                                     │           │
├─────────────────────────────────────┼───────────┤
│                                     │           │
│`      + startup.padEnd(37) + `│  2020.01  │
│                                     │           │
└─────────────────────────────────────┴───────────┘`

//const htt = process.title.includes('nodemon') ? http : https 

const server = http.createServer(/* {
   key: fs.readFileSync('./cert/localhost-key.pem'),
   cert: fs.readFileSync('./cert/localhost.pem'),
   passphrase: 'RANDOM WELCOME'
},  */app)

server.listen(PORT, () => {
   console.log(preview)
})