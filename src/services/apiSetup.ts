import axios from "axios";

const setupApiClient = () => {
  const backend = axios.create({
    baseURL: String(process.env.NEXT_PUBLIC_API_URL),
    withCredentials: true,
    headers: {
      "X-API-Key": String(process.env.NEXT_PUBLIC_API_KEY),
    },
  });

  let isRefreshing = false;
  let failedQueue: Array<{ resolve: Function; reject: Function }> = [];

  const processQueue = (error: any) => {
    failedQueue.forEach((prom) => {
      if (error) prom.reject(error);
      else prom.resolve();
    });
    failedQueue = [];
  };

  backend.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      const isRefreshCall = originalRequest?.url?.includes("auth/refresh");

      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !isRefreshCall
      ) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(() => backend(originalRequest));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          await backend.post("auth/refresh");
          processQueue(null);
          return backend(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    },
  );

  return backend;
};

export { setupApiClient };
