
import './style.css'
import { getBookListsSafely, getBookDetails } from './api.js'
import { render, renderBookDetails } from './render.js'

const app = document.querySelector('#app')

const state = {
  items: [],
  status: 'loading',
  error: null,
  query: '',
  sort: 'title',
  category: 'all',
  requestResults: [],
}

let selectedBook = null

async function loadBooks() {
  state.status = 'loading'
  state.error = null
  selectedBook = null
  render(state, app)

  try {
    const results = await getBookListsSafely()
    state.requestResults = results

    const successfulResults = results.filter(
      (result) => result.status === 'fulfilled'
    )

    if (successfulResults.length === 0) {
      throw new Error('All book requests failed. Please try again.')
    }

    const combinedBooks = successfulResults.flatMap(
      (result) => result.books
    )

    state.items = [
      ...new Map(
        combinedBooks.map((book) => [book.id, book])
      ).values(),
    ]

    state.status = 'success'
  } catch (error) {
    state.status = 'error'
    state.error = error.message || 'Unable to load books.'
  }

  render(state, app)
}

async function showBookDetails(book) {
  selectedBook = book

  app.innerHTML = `
    <main class="container">
      <button id="close-details" type="button">← Back to books</button>
      <section class="details-panel">
        <p class="loading-message">Loading book details...</p>
      </section>
    </main>
  `

  try {
    const details = await getBookDetails(book.id)

    // Ignore an old request if the user has selected another book.
    if (selectedBook !== book) return

    app.innerHTML = renderBookDetails(book, details)
  } catch (error) {
    if (selectedBook !== book) return

    app.innerHTML = `
      <main class="container">
        <button id="close-details" type="button">← Back to books</button>
        <section class="error-message">
          <h2>Could not load book details</h2>
          <p>${escapeHTML(error.message)}</p>
          <button id="retry-details" type="button">Try again</button>
        </section>
      </main>
    `
  }
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character])
}

// Search books as the user types.
app.addEventListener('input', (event) => {
  if (event.target.id !== 'book-search') return

  state.query = event.target.value
  const cursorPosition = event.target.selectionStart

  render(state, app)

  const searchInput = app.querySelector('#book-search')
  searchInput?.focus()
  searchInput?.setSelectionRange(cursorPosition, cursorPosition)
})

// Sorting and subject filters.
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

// All buttons are handled here using event delegation.
app.addEventListener('click', async (event) => {
  const retryButton = event.target.closest('#retry-button')
  const closeButton = event.target.closest('#close-details')
  const retryDetailsButton = event.target.closest('#retry-details')
  const detailsButton = event.target.closest('.details-button')

  if (retryButton) {
    await loadBooks()
    return
  }

  if (closeButton) {
    selectedBook = null
    render(state, app)
    return
  }

  if (retryDetailsButton && selectedBook) {
    await showBookDetails(selectedBook)
    return
  }

  if (detailsButton) {
    const bookId = detailsButton.dataset.bookId
    const book = state.items.find((item) => item.id === bookId)

    if (book) {
      await showBookDetails(book)
    }
  }
})

loadBooks()
