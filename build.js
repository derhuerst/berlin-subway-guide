'use strict'

const fs      = require('fs')
const path    = require('path')
const pick    = require('lodash.pick')
const photos  = require('vbb-station-photos')
const flickr  = require('flickr-photo-url')
const queue   = require('queue')
const lookup  = require('vbb-stations')

const pkg    = require('./package.json')
const tpl    = require('./src/template')



const sortPlatforms = (a, b) =>
	  (a.line > b.line) ?  1
	: (a.line < b.line) ? -1
	:                      0



const _ = pick(pkg, ['title', 'description', 'author'])

const platforms = []
const q = queue()
q.concurrency = 5

Object.keys(photos.list).forEach((id) => {
	const station = photos.list[id]
	Object.keys(station).forEach((line) => {
		const set = station[line]
		if (!set.label) return
		q.push((next) =>
			Promise.all([
				lookup(true, +id),
				flickr('ingolfbln', set.label, 'z')
			]).catch(next)
			.then((all) => {

				platforms.push({
					  station: all[0][0].name
					, line:    line
					, img:     all[1]
				})

				next()
			}).catch(next))
	})
})

q.start((err) => {
	if (err) return console.error(err.stack)

	const html = tpl(_, platforms.sort(sortPlatforms))
	const dest = path.join(__dirname, 'index.html')
	fs.writeFile(dest, html, (err) => {
		if (err) return console.error(err.stack)
		console.log('done')
	})

})
