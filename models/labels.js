let mongoose = require('mongoose')
let {marked} = require('marked')
let slugify = require('slugify')
let createDomPurify = require('dompurify')
let { JSDOM } = require('jsdom')
let dompurify = createDomPurify(new JSDOM().window)

let labelschema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    }, ingredients: {
        type: String,
        required: true
    }, createdAt: {
        type: Date,
        default: Date.now
    }, useUntill: {
        type: Date,
        default:new Date()+3
    }, chef: {
        type: String
    }, slug: {
        type: String,
        required: true,
        unique: true
    }, sanitizedHtml: {
        type: String,
        required: true
    }
})

labelschema.pre('validate', function(next) {
    let d = new Date();
    if (this.title) {
        this.slug = slugify(this.title, { lower: true, strict: true })
    }

    if (this.ingredients) {
        this.sanitizedHtml = dompurify.sanitize(marked(this.ingredients))
    }

    if (this.useUntill) {
        this.useUntill.setDate(d.getDate() + 3);
    }

    next()
})

module.exports = mongoose.model('Label', labelschema)
