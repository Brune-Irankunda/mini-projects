
function escapeHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderLoading() {
  return `
    <p class="loading-message">Loading books...</p>
  `
}

function renderError(state) {
  return `
    <section class="error-message">
      <h2>Something went wrong</h2>
      <p>${escapeHTML(state.error || 'Unable to load books.')}</p>
      <button id="retry-button" type="button">Try again</button>
    </section>
  `
}

export function renderBookDetails(book, details) {
  const description =
    typeof details.description === 'string'
      ? details.description
      : details.description?.value || 'No description available.'

  const subjects = Array.isArray(details.subjects)
    ? details.subjects
    : []

  return `
    <section class="book-details">
      <button id="close-details" type="button">
        ← Back to books
      </button>

      <h2>${escapeHTML(book.title)}</h2>
      <p><strong>Author:</strong> ${escapeHTML(book.author)}</p>
      <p><strong>First published:</strong> ${escapeHTML(book.year)}</p>

      <h3>Description</h3>
      <p>${escapeHTML(description)}</p>

      <h3>Subjects</h3>
      <p>${
        subjects.length
          ? escapeHTML(subjects.slice(0, 10).join(', '))
          : 'No subjects available.'
      }</p>
    </section>
  `
}

export function render(state, app) {
  if (!app) return

  if (state.status === 'loading') {
    app.innerHTML = renderLoading()
    return
  }

  if (state.status === 'error') {
    app.innerHTML = renderError(state)
    return
  }

  const query = (state.query || '').toLowerCase().trim()

  let books = (state.items || []).filter((book) =>
    `${book.title} ${book.author}`
      .toLowerCase()
      .includes(query)
  )

  if (state.category && state.category !== 'all') {
    books = books.filter((book) =>
      book.subjects?.some((subject) =>
        subject.toLowerCase().includes(state.category.toLowerCase())
      )
    )
  }

  books.sort((a, b) => {
    if (state.sort === 'year') {
      const yearA = Number(a.year) || 0
      const yearB = Number(b.year) || 0
      return yearB - yearA
    }

    return a.title.localeCompare(b.title)
  })

  const requestResults = state.requestResults || []

  app.innerHTML = `
    <main class="container">
      <header class="page-header">
        <h1>Async Data Explorer</h1>
        <p>Discover books using the Open Library API.</p>
      </header>

      <section class="controls">
        <label for="book-search">Search books</label>
        <input
          id="book-search"
          type="search"
          placeholder="Search by title or author..."
          value="${escapeHTML(state.query || '')}"
        />

        <label for="book-sort">Sort books</label>
        <select id="book-sort">
          <option value="title" ${state.sort === 'title' ? 'selected' : ''}>
            Title A–Z
          </option>
          <option value="year" ${state.sort === 'year' ? 'selected' : ''}>
            Newest first
          </option>
        </select>

        <label for="book-category">Filter by subject</label>
        <select id="book-category">
          <option value="all" ${!state.category || state.category === 'all' ? 'selected' : ''}>
            All subjects
          </option>
          <option value="programming" ${state.category === 'programming' ? 'selected' : ''}>
            Programming
          </option>
          <option value="computer" ${state.category === 'computer' ? 'selected' : ''}>
            Computer
          </option>
          <option value="science" ${state.category === 'science' ? 'selected' : ''}>
            Science
          </option>
        </select>
      </section>

      <section class="api-status">
        <h2>API Request Status</h2>
        ${
          requestResults.length
            ? requestResults.map((result) => `
                <p>
                  <strong>${escapeHTML(result.query)}:</strong>
                  ${
                    result.status === 'fulfilled'
                      ? 'Request successful'
                      : `Request failed: ${escapeHTML(result.error || 'Unknown error')}`
                  }
                </p>
              `).join('')
            : '<p>No request information available.</p>'
        }
      </section>

      <p class="book-count">
        Showing ${books.length} of ${(state.items || []).length} books
      </p>

      ${
        books.length
          ? `
            <section class="book-grid">
              ${books.map((book) => `
                <article class="book-card">
                  ${
                    book.coverId
                      ? `<img
                          src="https://covers.openlibrary.org/b/id/${Number(book.coverId)}-M.jpg"
                          alt="Cover of ${escapeHTML(book.title)}"
                          loading="lazy"
                        />`
                      : '<div class="no-cover">No cover available</div>'
                  }
                  <h2>${escapeHTML(book.title)}</h2>
                  <p>${escapeHTML(book.author)}</p>
                  <p>First published: ${escapeHTML(book.year)}</p>
                  <button
                    class="details-button"
                    data-book-id="${escapeHTML(book.id)}"
                    type="button"
                  >
                    View details
                  </button>
                </article>
              `).join('')}
            </section>
          `
          : '<p class="empty-state">No books found. Try another search.</p>'
      }
    </main>
  `
}
