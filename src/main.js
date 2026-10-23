
import './style.css'
import { getBooks } from './api.js'
import { render } from './render.js'

const app = document.querySelector('#app')

const state = {
  items: [],
  status: 'loading',
  error: null,
  query: '',
  sort: 'title',
  category: 'all',
}

async function loadBooks() {
  state.status = 'loading'
  state.error = null
  render(state, app)

  try {
    state.items = await getBooks()
    state.status = 'success'
  } catch (error) {
    state.status = 'error'
    state.error = error.message || 'An unexpected error occurred.'
  }

  render(state, app)
}

app.addEventListener('input', (event) => {
  if (event.target.id !== 'book-search') return

  state.query = event.target.value
  const cursorPosition = event.target.selectionStart

  render(state, app)

  const searchInput = app.querySelector('#book-search')
  searchInput?.focus()
  searchInput?.setSelectionRange(cursorPosition, cursorPosition)
})

app.addEventListener('change', (event) => {
  if (event.target.id === 'book-sort') {
    state.sort = event.target.value
    render(state, app)
  }

  if (event.target.id === 'book-category') {
    state.category = event.target.value
    render(state, app)
  }
})

app.addEventListener('click', (event) => {
  if (event.target.closest('#retry-button')) {
    loadBooks()
  }
})

loadBooks()
