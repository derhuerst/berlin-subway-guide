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



const _ = pick(pkg, ['title', 'description', 'author'])

let platforms = {}
const q = queue()
q.concurrency = 5

Object.keys(photos.list).forEach((id) => {
	const station = photos.list[id]
	Object.keys(station).forEach((line) => {
		const set = station[line]
		if (!set.label) return
		if (!(line in platforms)) platforms[line] = []
		q.push((next) =>
			Promise.all([
				lookup(true, +id),
				flickr(set.label[0], set.label[1], 'z')
			]).then((all) => {

				platforms[line].push({
					  station: all[0][0].name
					, line:    line
					, img:     all[1]
				})

				console.info(line, all[0][0].name, '✓')
				next()
			}, next).catch(next))
	})
})

// q.on('error', (err) => {
// 	console.error(err.message)
// 	q.start()
// })
q.start(() => {
	const html = tpl(_, platforms)
	const dest = path.join(__dirname, 'index.html')
	fs.writeFile(dest, html, (err) => {
		if (err) return console.error(err.stack)
		console.log('done')
	})
})
