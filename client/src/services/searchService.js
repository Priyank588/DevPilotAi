import api from './api'

const searchService = {
  search: (query) => api.get('/search', { params: { query } })
}

export default searchService
