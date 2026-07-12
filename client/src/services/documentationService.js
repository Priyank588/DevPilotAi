import api from './api'

const documentationService = {
  generateDocs: (data) => api.post('/docs/generate', data)
}

export default documentationService
