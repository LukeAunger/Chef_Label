let express = require('express')
let Label = require('./../models/labels')
let router = express.Router()

router.get('/new', (req, res) => {
    res.render('labels/new', {label: new Label()})
})

router.get('/edit/:id', async (req, res) => {
    let label = await Label.findById(req.params.id)
    res.render('labels/edit', {label: label})
})

router.get('/:slug', async (req, res) => {
    let label = await Label.findOne({ slug: req.params.slug})
    if (label == null) {
        res.redirect('/')
    }
    res.render('labels/show', {label: label})
})

router.post('/', async (req, res, next) => {
    req.label = new Label()
    next()
}, saveLabelAndRedirect('new'))

router.put('/:id', async (req, res, next) => {
    req.label = await Label.findById(req.params.id)
    next()
}, saveLabelAndRedirect('edit'))

router.delete('/:id', async (req, res) => {
    await Label.findByIdAndDelete(req.params.id)
    res.redirect('/')
})

function saveLabelAndRedirect(path) {
    return async (req, res) => {
        let label = req.label
            label.title = req.body.title
            label.ingredients = req.body.ingredients
        try {
           label =  await label.save()
           res.redirect(`/labels/${label.slug}`)
        } catch (e) {
            res.render('labels/${path}', {label: label})
            console.log(e);
        }
    }
}
module.exports = router;
