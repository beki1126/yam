import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,  // /api автоматаар нэмэх
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
```

Railway Variables:
```
VITE_API_URL=https://yam-production-c00d.up.railway.app
```

(Төгсгөлд `/api` БАЙХГҮЙ)

Git push → Redeploy

---

## Би Арга 1-ийг санал болгож байна (хурдан):

Railway Variables:
```
VITE_API_URL=https://yam-production-c00d.up.railway.app/api
