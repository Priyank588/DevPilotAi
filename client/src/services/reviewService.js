import api from './api'

const reviewService = {
  createReview: (data) => api.post('/reviews', data),
  getReviews: () => api.get('/reviews'),
  getReview: (id) => api.get(`/reviews/${id}`),
  deleteReview: (id) => api.delete(`/reviews/${id}`)
}

export default reviewService
