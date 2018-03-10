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
	, h.meta({name: 'author', content: _.author.name})
	, h.meta({name: 'description', content: _.description})
	, h.meta({name: 'viewport', content: 'width=device-width,initial-scale=1'})
	, h.link({rel: 'profile', href: 'http://osprotocol.com'})
	, h.meta({property: 'os:repo', content: 'https://github.com/derhuerst/berlin-subway-guide'})
	, h.meta({property: 'os:rsc_type', content: 'git'})
	, h.meta({property: 'os:src', content: 'https://github.com/derhuerst/berlin-subway-guide'})
	, h.meta({property: 'os:issue', content: 'https://github.com/derhuerst/berlin-subway-guide/issues'})
	, h.style({type: 'text/css'}, [new h.SafeString(styles.toString())])
])

const footer = (_) => h.footer({}, [
	h.p({}, [
		  'Thanks to '
		, h.a({href: 'https://www.flickr.com/photos/ingolfbln'}, [
			h.i(null, 'ingolfbln')
		])
		, ' for the data!'
	]),
	h.p({}, [
		  'made with '
		, h.span('.love', '❤')
		, ' by '
		, h.a({href: _.author.url}, _.author.name)
	])
])



const sortPlatform = (p) => tokenize(p.station)
	.filter((t) => t !== 'ubahn' && t !== 'sbahn')
	.join(' ')

const link = (platform) => h.li(null, [
	h.a({
		href: '#' + slug(platform.station + '-' + platform.line)
	}, [shorten(platform.station)])
])

const index = (platforms) => {
	const r = []
	const lines = Object.keys(platforms).sort()
	for (let line of lines) {
		r.push(h.h2(null, line))
		const p = sortBy(platforms[line], sortPlatform)
		r.push(h.ul(null, p.map(link)))
	}
	return h.div(null, r)
}



const platform = (platform) => {
	return h.li({
	  class: 'platform'
	, id:    slug(platform.station + '-' + platform.line)
}, [
	h.h3(null, shorten(platform.station)),
	h.a({
		href: platform.link,
		target: '_blank'
	}, [
		h.img({
			  src: platform.url
			, alt: `photo of ${shorten(platform.station)}`
		})
	])
])
}

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
	h.body(null, [
		  h.h1({}, 'Berlin Subway Guide')
		, index(platforms)
		, list(platforms)
		, footer(_)
	])
])


module.exports = page

