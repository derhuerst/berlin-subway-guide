'use strict'

const rawPhotos = require('vbb-station-photos/photos')
const smallPhotos = require('vbb-station-photos/small.json')
const largePhotos = require('vbb-station-photos/large.json')
const getStations = require('vbb-stations')
const path = require('path')
const fs      = require('fs')
const pick    = require('lodash.pick')

const pkg    = require('./package.json')
const tpl    = require('./src/template')

const generateLink = (data) => {
	if (data[0] === 'flickr') {
		return `https://www.flickr.com/photos/${data[1]}/${data[2]}/`
	} if (data[0] === 'commons') {
		return `https://commons.wikimedia.org/wiki/File:${data[1]}`
	} else return null
}

let platforms = {}

const byStation = rawPhotos
for (let id in byStation) {
	const station = getStations(id)[0]
	if (!station) continue
	const byLine = byStation[id]
	for (let line in byLine) {
		const byPerspective = byLine[line]
		if (!byPerspective.label) continue

		const smallUrl = smallPhotos[id][line].label
		const largeUrl = largePhotos[id][line].label
		const link = generateLink(rawPhotos[id][line].label)
		if (!smallUrl || !largeUrl || !link) continue

		if (!(line in platforms)) platforms[line] = []
		platforms[line].push({
			station: station.name,
			line,
			smallUrl,
			largeUrl,
			link
		})
	}
}

const html = tpl(pick(pkg, ['title', 'description', 'author']), platforms)
const dest = path.join(__dirname, 'index.html')
fs.writeFileSync(dest, html)
