const fs = require('fs')
const path = require('path')

const DomParser = () => { }

const templateFolder = './templates'

class Template {
    constructor(raw) {
        this.raw = raw
        this.type = Object.defineProperty(this, "type", { value:"Template", writable: true })
    }
}


DomParser.openSPR = (template, folder=templateFolder) => {

    let tpath = `${templateFolder}/${template}`

    if (!template || template === undefined) {
        return new Error('No template found')
    }

    let pn = path.extname(tpath)

    if (pn !== '.spr') {
        return new Error(`Cannot read ${pn} file. Please, use only .spr files as templates`)
    }

    return new Template(fs.readFileSync(tpath, 'utf8'))
}


DomParser.parse = (template, values) => {

    //Парс var

    let variableRegExp = /(\{--[^\0]*?\--})/gm

    let variableList = template.raw.matchAll(variableRegExp)

    Array.from(variableList).map( (match, value) => {
        let find = match[0].replace('{--', '').replace('--}', '').trim()

        let ss = values[find]

        template.raw = template.raw.replace(match[0], ss)
    })

    //Парс функций

    let functionRegExp = /(\[--[^\0]*?\--])/gm
    
    let functionList = template.raw.matchAll(functionRegExp)
    
    Array.from(functionList).map( (match, value) => {
        // console.log(match, value)
        let find = match[0].replace('[--', '').replace('--]', '').trim()
        
        let ss = eval(find)
        
        template.raw = template.raw.replace(match[0], ss)
    })

    /* console.log(template.raw) */

    return template
}


const domStyling = (s) => `style="${s}"`


DomParser.StyleSheet = (data) => {

    let dates = ""

    for (item in data) {

        let val = data[item]

        if ( (typeof val) == "number" ) {
            val += "px"
        }

        dates += `${item}: ${val}; `
    }

    return dates.trim()/* domStyling(dates) */
    
}


module.exports = DomParser
