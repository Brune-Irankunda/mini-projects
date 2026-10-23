
const BASE_URL = 'https://openlibrary.org'

export async function getJSON(url) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`)
  }

  return response.json()
}

export async function getBooks(query = 'javascript') {
  const url = `${BASE_URL}/search.json?q=${encodeURIComponent(query)}&limit=24`

  const data = await getJSON(url)

  return data.docs.map((book) => ({
    id: book.key,
    title: book.title ?? 'Untitled book',
    author: book.author_name?.join(', ') ?? 'Unknown author',
    year: book.first_publish_year ?? 'Year unknown',
    coverId: book.cover_i ?? null,
    subjects: book.subject?.slice(0, 3) ?? [],
  }))
}

// Promise.all(): all requests must succeed.
export async function getMultipleBookLists() {
  const [javascriptBooks, pythonBooks] = await Promise.all([
    getBooks('javascript'),
    getBooks('python'),
  ])

  return {
    javascriptBooks,
    pythonBooks,
  }
}

// Promise.allSettled(): inspect every request, even if one fails.
export async function getBookListsSafely() {
  const results = await Promise.allSettled([
    getBooks('javascript'),
    getBooks('python'),
  ])

  return results.map((result, index) => ({
    query: index === 0 ? 'javascript' : 'python',
    status: result.status,
    books: result.status === 'fulfilled' ? result.value : [],
    error: result.status === 'rejected'
      ? result.reason.message
      : null,
  }))
}

export async function getBookDetails(id) {
  return getJSON(`${BASE_URL}${id}.json`)
}
