import api from './api'

const analyticsService = {
  getAnalytics: () => api.get('/analytics'),
  getSummary: () => api.get('/analytics/summary')
}

export default analyticsService
