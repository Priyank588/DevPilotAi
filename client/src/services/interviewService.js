import api from './api'

const interviewService = {
  generateQuestions: (data) => api.post('/interviews', data),
  getInterviews: () => api.get('/interviews'),
  getInterview: (id) => api.get(`/interviews/${id}`),
  deleteInterview: (id) => api.delete(`/interviews/${id}`)

}

export default interviewService
