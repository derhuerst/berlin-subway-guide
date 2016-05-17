'use strict'

const fs      = require('fs')
const path    = require('path')
const pick    = require('lodash.pick')
const photos  = require('vbb-station-photos')
const queue   = require('queue')
const lookup  = require('vbb-stations')

const pkg    = require('./package.json')
const tpl    = require('./src/template')



fs.symlinkSync(photos.dir, path.join(__dirname, 'photos'))



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
		q.push((next) => lookup(true, +id).catch(next).then((r) => {

			const file = path.relative(photos.dir, photos(id, line, 'label'))
			platforms.push({
				  station: r[0].name
				, line:    line
				, img:     path.join('photos', file)
			})

			next()
		}).catch(next))
	})
})

q.start((err) => {
	if (err) return console.error(err.message)

	const html = tpl(_, platforms.sort(sortPlatforms))
	const dest = path.join(__dirname, 'index.html')
	fs.writeFile(dest, html, (err) => {
		if (err) return console.error(err.stack)
		console.log('done')
	})

})
