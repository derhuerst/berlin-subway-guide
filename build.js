'use strict'

const path    = require('path')
const photos  = require('vbb-station-photos')
const lookup  = require('vbb-stations')
const fs      = require('fs')
const pick    = require('lodash.pick')

const pkg    = require('./package.json')
const tpl    = require('./src/template')



let platforms = {}

const byStation = photos.list
for (let id in byStation) {
	const station = lookup(+id)[0]
	if (!station) continue
	const byLine = byStation[id]
	for (let line in byLine) {
		const set = byLine[line]
		if (!set.label) continue

		const src = photos(id, line, 'label')
		if (!src) continue
		const base = path.basename(src)
		const dest = path.join(__dirname, 'photos', base)
		fs.linkSync(src, dest)

		if (!(line in platforms)) platforms[line] = []
		platforms[line].push({station: station.name, line, img: base})
	}
}

const html = tpl(pick(pkg, ['title', 'description', 'author']), platforms)
const dest = path.join(__dirname, 'index.html')
fs.writeFileSync(dest, html)
