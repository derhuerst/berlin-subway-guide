'use strict'

const h       = require('pithy')
const fs      = require('fs')
const path    = require('path')
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



const index = (platforms) => h.ul(null, platforms.map((p) =>
	h.li(null, [
		h.a({href: '#' + slug(p.station + '-' + p.line)}, [
			`${shorten(p.station)} – ${p.line}`
		])
	])))

const platform = (p) => h.li(
	{class: 'platform', id: slug(p.station + '-' + p.line)}, [
	h.h2({}, `${shorten(p.station)} – ${p.line}`),
	h.img({src: p.img, alt: `photo of ${shorten(p.station)}`})
])

const page = (_, platforms) => `<!DOCTYPE html>` + h.html(null, [
	head(_),
	h.body(null, [
		  h.h1({}, 'Berlin Subway Guide')
		, index(platforms)
		, h.ul('#platforms', platforms.map(platform))
		, footer(_)
	])
])


module.exports = page

