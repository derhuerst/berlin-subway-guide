'use strict'

const h = require('h2ml')
const secure = require('xss')
const fs = require('fs')
const path = require('path')
const sortBy = require('lodash.sortby')
const tokenize = require('vbb-tokenize-station')
const shorten = require('vbb-short-station-name')
const slug = require('slugg')

const styles = fs.readFileSync(path.join(__dirname, 'styles.css'))

const head = (_) => h('head', {}, [
	h('meta', {charset: 'utf-8'}),
	h('title', {}, secure(_.title)),
	h('meta', {name: 'author', content: secure(_.author.name)}),
	h('meta', {name: 'description', content: secure(_.description)}),
	h('meta', {name: 'viewport', content: 'width=device-width,initial-scale=1'}),
	h('link', {rel: 'profile', href: 'http://osprotocol.com'}),
	h('meta', {property: 'os:repo', content: 'https://github.com/derhuerst/berlin-subway-guide'}),
	h('meta', {property: 'os:rsc_type', content: 'git'}),
	h('meta', {property: 'os:src', content: 'https://github.com/derhuerst/berlin-subway-guide'}),
	h('meta', {property: 'os:issue', content: 'https://github.com/derhuerst/berlin-subway-guide/issues'}),
	h('style', {type: 'text/css'}, styles.toString())
])

const footer = (_) => h('footer', {}, [
	h('p', {}, [
		'Thanks to ',
		h('a', {href: 'https://www.flickr.com/photos/ingolfbln'}, [
			h('i', {}, 'ingolfbln')
		]),
		' for the data!'
	]),
	h('p', {}, [
		'made with ',
		h('span', '.love', '❤'),
		' by ',
		h('a', {href: encodeURI(_.author.url)}, secure(_.author.name)),
	])
])

const sortPlatform = (p) => {
	return tokenize(p.station)
	.filter((t) => t !== 'ubahn' && t !== 'sbahn')
	.join(' ')
}

const link = (platform) => h('li', {}, [
	h('a', {
		href: '#' + slug(platform.station + '-' + platform.line)
	}, [
		secure(shorten(platform.station))
	])
])

const index = (platforms) => {
	const r = []
	const lines = Object.keys(platforms).sort()
	for (let line of lines) {
		r.push(h('h2', {}, secure(line)))
		const p = sortBy(platforms[line], sortPlatform)
		r.push(h('ul', {}, p.map(link)))
	}
	return h('div', {}, r)
}

const platform = (platform) => {
	return h('li', {
		class: 'platform',
		id: slug(platform.station + '-' + platform.line)
	}, [
		h('h3', {}, secure(shorten(platform.station))),
		h('a', {
			href: encodeURI(platform.link),
			target: '_blank'
		}, [
			h('img', {
				src: encodeURI(platform.url),
				alt: `photo of ${secure(shorten(platform.station))}`
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
	return h('ul', {id: 'platforms'}, r)
}

const serviceWorker = h('script', {}, `
if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('/service-worker.js')
	.catch(console.error)
}
`)

const page = (_, platforms) => {
	return `<!DOCTYPE html>` +
	h('html', {}, [
		head(_),
		h('body', {}, [
			h('h1', {}, 'Berlin Subway Guide'),
			index(platforms),
			list(platforms),
			footer(_),
			serviceWorker
		])
	])
}

module.exports = page
