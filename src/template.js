'use strict'

const h       = require('pithy')
const fs      = require('fs')
const path    = require('path')
const sortBy = require('lodash.sortby')
const tokenize = require('vbb-tokenize-station')
const shorten = require('vbb-short-station-name')
const slug    = require('slugg')

const styles = fs.readFileSync(path.join(__dirname, 'styles.css'))



const head = (_) => h.head(null, [
	  h.meta({charset: 'utf-8'})
	, h.title(null, _.title)
	, h.meta({name: 'author', content: _.author})
	, h.meta({name: 'description', content: _.description})
	, h.meta({name: 'viewport', content: 'width=device-width,initial-scale=1'})
	, h.style({type: 'text/css'}, [new h.SafeString(styles.toString())])
])

const footer = (_) => h.footer({}, [
	h.p({}, [
		  'made with '
		, h.span('.love', '❤')
		, ' by '
		, h.a({href: 'https://jannisr.de/'}, _.author)
	])
])



const sortPlatform = (p) => tokenize(p.station)
	.filter((t) => t !== 'ubahn' && t !== 'sbahn')
	.join(' ')

const platform = (platform) => h.li({
	  class: 'platform'
	, id:    slug(platform.station + '-' + platform.line)
}, [
	h.img({
		  src: platform.img
		, alt: `photo of ${shorten(platform.station)}`
	})
])

const list = (platforms) => {
	const r = []
	const lines = Object.keys(platforms).sort()
	for (let line of lines) {
		const ps = sortBy(platforms[line], sortPlatform)
		for (let p of ps) r.push(platform(p))
	}
	return h.ul('#platforms', r)
}



const page = (_, platforms) => `<!DOCTYPE html>` + h.html(null, [
	head(_),
	h.body(null, [list(platforms)])
])


module.exports = page

