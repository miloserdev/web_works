const _navigator = document.getElementsByTagName('navigator')[0]
const nav_items = Array.from(_navigator.getElementsByTagName('item'))

nav_items.forEach(element => {
    element.addEventListener('click',
        event => {
            nav_items.forEach(item => {
                item.removeAttribute('active')
            })
            event.target.setAttribute('active', 'a')
        }, false)
})


const _prenavigator = document.getElementsByTagName('prenav')[0]
const prenavnav_items = Array.from(_prenavigator.getElementsByTagName('a'))

prenavnav_items.forEach(element => {
    element.addEventListener('click',
        event => {
            prenavnav_items.forEach(item => {
                item.removeAttribute('active')
            })
            event.target.setAttribute('active', 'a')
        }, false)

})

Array.from(document.getElementsByTagName('app')[0].children).forEach(el => {
    console.log(el)
    window['$' + el.tagName.toLowerCase()] = el
})

$header.style.visibility = 'hidden'
$navigator.style.visibility = 'hidden'


var ts;

$content.addEventListener('touchstart', (event) => {
   ts = event.changedTouches[0].clientY;
   console.log(ts)
});

$content.addEventListener('touchmove', (event) => {
    let formule = event.changedTouches[0].clientY + ts;
    formule = (formule < 0) ? 0 : formule
    event.target.style.transform = `translateY(${formule}px)`
    console.log(formule)
}, false)