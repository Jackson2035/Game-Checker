const express = require('express')
const router = express.Router()
const Game = require('../models/game')
const Developer = require('../models/developer')
//const game = require('../models/game')
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']

// All Games Route
router.get('/', async (req, res) => {
  let query = Game.find()
  if (req.query.title != null && req.query.title != '') {
    query = query.regex('title', new RegExp(req.query.title, 'i'))
  }
  if (req.query.releasedBefore != null && req.query.releasedBefore != '') {
    query = query.lte('releaseDate', req.query.releasedBefore)
  }
  if (req.query.releasedAfter != null && req.query.releasedAfter != '') {
    query = query.gte('releaseDate', req.query.releasedAfter)
  }
  try {
    const games = await query.exec()
    res.render('games/index', {
      games: games,
      searchOptions: req.query
    })
  } catch {
    res.redirect('/')
  }
})

// New Game Route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Game())
})

// Create Game Route
router.post('/', async (req, res) => {
    const game = new Game({
      title: req.body.title,
      developer: req.body.developer,
      releaseDate: new Date(req.body.releaseDate),
      playTime: req.body.playTime,
      publisher: req.body.publisher,
      genre: req.body.genre,
      description: req.body.description
    })
    saveCover(game, req.body.cover)

    try {
      const newGame = await game.save()
      res.redirect(`games/${newGame.id}`)
    } catch {
      renderNewPage(res, game, true)
    }
  })

// Show Game Route
router.get('/:id', async (req, res) => {
    try {
      const game = await Game.findById(req.params.id).populate('developer').exec()
      res.render('games/show', { game: game })
    } catch {
        res.redirect('/')
    }
})

// Edit Game Route
router.get('/:id/edit', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id)
    renderEditPage(res, game)
  } catch {
    res.redirect('/')
  }
})

// Update Game Route
router.put('/:id', async (req, res) => {
  let game

  try {
    game = await Game.findById(req.params.id)
    game.title = req.body.title
    game.developer = req.body.developer
    game.releaseDate = new Date(req.body.releaseDate)
    game.playTime = req.body.playTime
    game.publisher = req.body.publisher
    game.genre = req.body.genre
    game.description = req.body.description
    if (req.body.cover != null && req.body.cover !== '') {
      saveCover(game, req.body.cover)
    }
    await game.save()
    res.redirect(`/games/${game.id}`)
  } catch {
    if (game != null) {
      renderEditPage(res, game, true)
    } else {
      res.redirect('/')
    }
  }
})

// Delete Game Page
router.delete('/:id', async (req, res) => {
  try {
    game = await Game.findById(req.params.id)
    await game.remove()
    res.redirect('/games')
  } catch {
    if (game != null) {
      res.render('games/show', {
        game: game,
        errorMessage: 'Could not remove game'
      })
    } else {
      res.redirect('/')
    }
  }
})

async function renderNewPage(res, game, hasError = false) {
  renderFormPage(res, game, 'new', hasError)
}

async function renderEditPage(res, game, hasError = false) {
  renderFormPage(res, game, 'edit', hasError)
}

async function renderFormPage(res, game, form, hasError = false) {
  try {
    const developers = await Developer.find({})
    const params = {
      developers: developers,
      game: game
    }
    if (hasError) {
      if (form === 'edit') {
        params.errorMessage = 'Error Updating Game'
      } else {
        params.errorMessage = 'Error Creating Game'
      }
    }
    res.render(`games/${form}`, params)
  } catch {
    res.redirect('/games')
  }
}
  
function saveCover(game, coverEncoded) {
  if (coverEncoded == null) return
  const cover = JSON.parse(coverEncoded)
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    game.coverImage = new Buffer.from(cover.data, 'base64')
    game.coverImageType = cover.type
  }
}

  module.exports = router