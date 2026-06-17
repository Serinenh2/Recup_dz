import axios from 'axios'

const api = axios.create({ baseURL: '/api/ai' })

api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('access_token')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})
api.interceptors.response.use(r => r, async e => {
  if (e.response?.status === 401 && !e.config._retry) {
    const ref = localStorage.getItem('refresh_token')
    if (ref) {
      try {
        e.config._retry = true
        const { data } = await axios.post('/api/auth/token/refresh/', { refresh: ref })
        localStorage.setItem('access_token', data.access)
        e.config.headers.Authorization = `Bearer ${data.access}`
        return api(e.config)
      } catch {
        localStorage.clear()
        window.location.href = '/login'
      }
    } else {
      localStorage.clear()
      window.location.href = '/login'
    }
  }
  return Promise.reject(e)
})

export const aiDashboardAPI = {
  statistiques: () => api.get('/dashboard/statistiques/'),
  alertesRecuperees: () => api.get('/dashboard/alertes_recuperees/'),
  historiqueRecent: () => api.get('/dashboard/historique_recent/'),
  recommandationsActives: () => api.get('/dashboard/recommandations_actives/'),
  genererAlertes: () => api.post('/alertes/generer_alertes_auto/'),
}

export const aiConversationsAPI = {
  getAll: (p) => api.get('/conversations/', { params: p }),
  get: (id) => api.get(`/conversations/${id}/`),
  create: (d) => api.post('/conversations/', d),
  sendMessage: (id, d) => api.post(`/conversations/${id}/envoyer_message/`, d),
  analyseContextuelle: (d) => api.post('/conversations/analyse_contextuelle/', d),
  suggestions: () => api.get('/conversations/suggestions/'),
}

export const aiAlertesAPI = {
  getAll: (p) => api.get('/alertes/', { params: p }),
  marquerLue: (id) => api.post(`/alertes/${id}/marquer_lue/`),
  generer: () => api.post('/alertes/generer_alertes_auto/'),
  resume: () => api.get('/alertes/resume_alertes/'),
}

export const aiConnaissancesAPI = {
  getAll: (p) => api.get('/connaissances/', { params: p }),
  get: (id) => api.get(`/connaissances/${id}/`),
  rechercher: (terme) => api.get('/connaissances/rechercher_reglementaire/', { params: { terme } }),
  categories: () => api.get('/connaissances/categories/'),
}

export const aiRecommandationsAPI = {
  getAll: (p) => api.get('/recommandations/', { params: p }),
  changerStatut: (id, statut) => api.post(`/recommandations/${id}/changer_statut/`, { statut }),
  actives: () => api.get('/recommandations/recommendations_actives/'),
}
