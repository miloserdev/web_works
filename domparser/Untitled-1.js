var funcRegExp = /(\[-[^\0]*?\-])/gm
var funcMatches = template.raw.matchAll(funcRegExp);
Array.from(funcMatches).map( (prop, val) => {
    var props = prop[val].toString()
    props = props.replace(`/\r\n/`, '').replace('[-', '').replace('-]', '')

    var ev = eval(props)
    template.raw = template.raw.replace(prop[val], ev)

})

/* matches.map( (match, index) => {
        console.log(match, index)

        var ind = template.raw.match(matches[index])
        console.log(ind)
    }) */



    //matches[1] contains the value between the parentheses
/*     console.log(matches);
    console.log(mt) */

/*     
    if ( !template instanceof Template ) {
        return new Error('Object is not Template')
    }

    var variables = template.raw.match(/{([^}]+)}/g);

    for (match in variables) {
        let inf = variables[match].replace('{--', '').replace('--}', '').trim()
        let val = values[inf]
        template.raw = template.raw.replace(variables[match], val)
    }

    var dats = template.raw.match(/\(--(.*?--)\)/g);

    for (match in dats) {
        let inf = dats[match].replace('(--', '').replace('--)', '').trim()
        let val = values[inf]
        template.raw = template.raw.replace(dats[match], val)
    } */