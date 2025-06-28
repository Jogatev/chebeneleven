export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/login',
    LOGOUT: '/logout',
    REGISTER: '/register',
    USER: '/user',
  },
  
  JOBS: {
    LIST: '/jobs',
    CREATE: '/jobs',
    GET_BY_ID: (id: string | number) => `/jobs/${id}`,
    UPDATE: (id: string | number) => `/jobs/${id}`,
    DELETE: (id: string | number) => `/jobs/${id}`,
    ARCHIVE: (id: string | number) => `/jobs/${id}/archive`,
    MY_JOBS: '/my-jobs',
  },
  
  APPLICATIONS: {
    CREATE: '/applications',
    GET_BY_ID: (id: string | number) => `/applications/${id}`,
    UPDATE: (id: string | number) => `/applications/${id}`,
    MY_APPLICATIONS: '/my-applications',
    GET_BY_JOB: (jobId: string | number) => `/applications/job/${jobId}`,
    JOB: (jobId: string | number) => `/applications/job/${jobId}`,
    GET: (id: string | number) => `/applications/${id}`,
  },
  
  ACTIVITIES: {
    CREATE: '/activities',
    MY_ACTIVITIES: '/my-activities',
  },
  
  UPLOAD: {
    RESUME: '/upload-resume',
  },
  
  TEST: '/test',
} as const;

export const getFullApiPath = (endpoint: string) => `/api${endpoint}`; 