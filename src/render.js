
export function renderLoading(app) {
  app.innerHTML = `
    <main class="min-h-screen bg-slate-100 p-6">
      <div class="mx-auto max-w-6xl">
        <h1 class="text-3xl font-bold text-slate-900">
          Open Library Book Explorer
        </h1>

        <p class="mt-3 text-slate-600" role="status" aria-live="polite">
          Loading books...
        </p>

        <div class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          ${Array.from({ length: 8 }, () => `
            <div class="animate-pulse rounded-xl bg-white p-5 shadow">
              <div class="mx-auto h-48 w-32 rounded bg-slate-200"></div>
              <div class="mt-4 h-4 rounded bg-slate-200"></div>
              <div class="mt-3 h-4 w-1/2 rounded bg-slate-200"></div>
            </div>
          `).join('')}
        </div>
      </div>
    </main>
  `
}

export function renderError(app, message) {
  const main = document.createElement('main')
  main.className = 'min-h-screen bg-slate-100 p-6'

  const container = document.createElement('div')
  container.className = 'mx-auto max-w-6xl'

  const heading = document.createElement('h1')
  heading.className = 'text-3xl font-bold text-slate-900'
  heading.textContent = 'Open Library Book Explorer'

  const status = document.createElement('p')
  status.className = 'mt-4 text-red-700'
  status.setAttribute('role', 'status')
  status.setAttribute('aria-live', 'polite')
  status.textContent = `Sorry, we couldn't load the books: ${message}`

  const retry = document.createElement('button')
  retry.id = 'retry-button'
  retry.type = 'button'
  retry.className = 'mt-4 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700'
  retry.textContent = 'Retry'

  container.append(heading, status, retry)
  main.append(container)
  app.replaceChildren(main)
}

export function render(state, app) {
  if (state.status === 'loading') {
    renderLoading(app)
    return
  }

  if (state.status === 'error') {
    renderError(app, state.error)
    return
  }

  const query = (state.query ?? '').trim().toLowerCase()

  const books = state.items
    .filter(({ title }) => title.toLowerCase().includes(query))
    .toSorted((a, b) => {
      if (state.sort === 'newest') {
        const yearA = Number(a.year) || 0
        const yearB = Number(b.year) || 0

        if (yearA === 0 && yearB !== 0) return 1
        if (yearB === 0 && yearA !== 0) return -1

        return yearB - yearA
      }

      return a.title.localeCompare(b.title)
    })

  app.innerHTML = `
    <main class="min-h-screen bg-slate-100 p-6">
      <div class="mx-auto max-w-6xl">
        <h1 class="text-3xl font-bold text-slate-900">
          Open Library Book Explorer
        </h1>

        <p class="mt-2 text-slate-600">
          Discover books, authors, and publication years.
        </p>

        <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label for="book-search" class="mb-2 block font-medium text-slate-700">
              Search books by title
            </label>
            <input
              id="book-search"
              type="search"
              placeholder="Search the loaded books..."
              class="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              value="${escapeHTML(state.query ?? '')}"
            />
          </div>

          <div>
            <label for="book-sort" class="mb-2 block font-medium text-slate-700">
              Sort books
            </label>
            <select
              id="book-sort"
              class="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="title" ${state.sort === 'title' ? 'selected' : ''}>
                Title: A–Z
              </option>
              <option value="newest" ${state.sort === 'newest' ? 'selected' : ''}>
                Newest publication year
              </option>
            </select>
          </div>
        </div>

        <p class="mt-4 text-slate-700" role="status" aria-live="polite">
          Showing ${books.length} of ${state.items.length} books
        </p>

        ${
          books.length === 0
            ? `<p class="mt-8 rounded-xl bg-white p-8 text-center text-slate-600">
                 No books found. Try another search.
               </p>`
            : `
              <div class="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                ${books.map(({ id, title, author, year, coverId }) => `
                  <article
                    class="rounded-xl bg-white p-5 shadow transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    ${
                      coverId
                        ? `<img
                            src="https://covers.openlibrary.org/b/id/${Number(coverId)}-M.jpg"
                            alt="Cover of ${escapeHTML(title)}"
                            loading="lazy"
                            class="mx-auto h-48 w-full rounded-lg object-contain"
                          />`
                        : `<div class="flex h-48 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                             No cover available
                           </div>`
                    }

                    <h2 class="mt-4 font-semibold text-slate-900">
                      ${escapeHTML(title)}
                    </h2>

                    <p class="mt-2 text-sm text-slate-600">
                      ${escapeHTML(author)}
                    </p>

                    <p class="mt-2 text-sm text-slate-500">
                      Published: ${escapeHTML(year)}
                    </p>
                  </article>
                `).join('')}
              </div>
            `
        }
      </div>
    </main>
  `
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character])
}
