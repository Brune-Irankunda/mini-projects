
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
              <div class="h-48 rounded-lg bg-slate-200"></div>
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
  status.setAttribute('role', 'alert')
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

  const categories = [...new Set(
    state.items.flatMap((book) => book.subjects ?? [])
  )].sort((a, b) => a.localeCompare(b))

  const books = state.items
    .filter((book) =>
      book.title.toLowerCase().includes(query)
    )
    .filter((book) =>
      state.category === 'all' ||
      (book.subjects ?? []).includes(state.category)
    )
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
    <main class="min-h-screen bg-slate-100 p-6 sm:p-8">
      <div class="mx-auto max-w-6xl">
        <header>
          <p class="font-semibold uppercase tracking-widest text-indigo-600">
            Discover your next read
          </p>

          <h1 class="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
            Open Library Book Explorer
          </h1>

          <p class="mt-3 text-slate-600">
            Explore books, authors, publication years, and subjects.
          </p>
        </header>

        <section
          class="mt-8 grid grid-cols-1 gap-4 rounded-2xl bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Book search and filters"
        >
          <div>
            <label for="book-search" class="mb-2 block font-medium text-slate-700">
              Search by title
            </label>

            <input
              id="book-search"
              type="search"
              placeholder="Search loaded books..."
              value="${escapeHTML(state.query ?? '')}"
              class="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label for="book-sort" class="mb-2 block font-medium text-slate-700">
              Sort books
            </label>

            <select
              id="book-sort"
              class="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="title" ${state.sort === 'title' ? 'selected' : ''}>
                Title: A–Z
              </option>

              <option value="newest" ${state.sort === 'newest' ? 'selected' : ''}>
                Newest publication year
              </option>
            </select>
          </div>

          <div>
            <label for="book-category" class="mb-2 block font-medium text-slate-700">
              Filter by subject
            </label>

            <select
              id="book-category"
              class="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all" ${state.category === 'all' ? 'selected' : ''}>
                All subjects
              </option>

              ${categories.map((category) => `
                <option
                  value="${escapeHTML(category)}"
                  ${state.category === category ? 'selected' : ''}
                >
                  ${escapeHTML(category)}
                </option>
              `).join('')}
            </select>
          </div>
        </section>

        <div class="mt-6 flex items-center justify-between">
          <p class="text-slate-700" role="status" aria-live="polite">
            Showing <strong>${books.length}</strong> of ${state.items.length} books
          </p>
        </div>

        ${
          books.length === 0
            ? `
              <div class="mt-8 rounded-2xl bg-white p-10 text-center shadow-sm">
                <p class="text-4xl" aria-hidden="true">📚</p>
                <h2 class="mt-4 text-xl font-semibold text-slate-900">
                  No books found
                </h2>
                <p class="mt-2 text-slate-600">
                  Try another title or select a different subject.
                </p>
              </div>
            `
            : `
              <section
                class="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                aria-label="Books"
              >
                ${books.map(({ id, title, author, year, coverId }) => `
                  <article
                    class="overflow-hidden rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div class="relative flex h-48 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-100 via-purple-100 to-blue-100">
                      ${
                        coverId
                          ? `
                            <img
                              src="https://covers.openlibrary.org/b/id/${Number(coverId)}-M.jpg?default=false"
                              alt="Cover of ${escapeHTML(title)}"
                              loading="lazy"
                              class="h-full w-full object-contain"
                              onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"
                            />
                          `
                          : ''
                      }

                      <div
                        class="${coverId ? 'hidden' : 'flex'} absolute inset-0 flex-col items-center justify-center p-4 text-center text-indigo-800"
                        style="${coverId ? 'display:none' : ''}"
                        aria-label="No book cover available"
                      >
                        <span class="text-5xl" aria-hidden="true">📚</span>
                        <span class="mt-3 font-semibold">Book Cover</span>
                        <span class="mt-1 text-sm">No cover available</span>
                      </div>
                    </div>

                    <h2 class="mt-4 font-semibold leading-6 text-slate-900">
                      ${escapeHTML(title)}
                    </h2>

                    <p class="mt-2 text-sm text-slate-600">
                      ${escapeHTML(author)}
                    </p>

                    <p class="mt-3 text-sm text-slate-500">
                      Publication year: ${escapeHTML(year)}
                    </p>
                  </article>
                `).join('')}
              </section>
            `
        }

        <footer class="mt-10 border-t border-slate-200 py-6 text-center text-sm text-slate-500">
          Book data provided by
          <a
            href="https://openlibrary.org/"
            target="_blank"
            rel="noopener noreferrer"
            class="font-medium text-indigo-600 underline"
          >
            Open Library
          </a>
        </footer>
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
