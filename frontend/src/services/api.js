import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({ baseURL: BASE_URL })

export async function uploadResume(file, jobDescription, jobTitle = '', candidateName = '') {
	const form = new FormData()
	if (file) form.append('resume', file)
	form.append('jobDescription', jobDescription || '')
	form.append('jobTitle', jobTitle || '')
	form.append('candidateName', candidateName || '')

	const res = await api.post('/api/resumes', form, {
		headers: { 'Content-Type': 'multipart/form-data' },
	})
	return res.data
}

export async function getHistory() {
	const res = await api.get('/api/resumes')
	return res.data
}

export async function getResumeDetail(id) {
	const res = await api.get(`/api/resumes/${id}`)
	return res.data
}

export async function addJobAnalysis(id, jobTitle, jobDescription) {
	const res = await api.post(`/api/resumes/${id}/analyses`, { jobTitle, jobDescription })
	return res.data
}

export async function getLeaderboard() {
	const res = await api.get('/api/resumes/leaderboard')
	return res.data
}

export default api
