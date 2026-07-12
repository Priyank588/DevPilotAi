import api from './api'

const analysisService = {
  analyzeComplexity: (data) => api.post('/analysis/complexity', data),
  detectBugs: (data) => api.post('/analysis/bugs', data)
}

export default analysisService
