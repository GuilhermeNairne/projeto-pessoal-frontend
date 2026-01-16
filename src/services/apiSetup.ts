import axios from "axios";

const setupApiClient = () => {
  const backend = axios.create({
    baseURL: String(process.env.NEXT_PUBLIC_API_URL),
    withCredentials: true,
  });

  backend.interceptors.response.use(
    (response) => {
      return response;
    },
    (error: any) => {
      console.log(error);
      return Promise.reject(error);
    }
  );

  return backend;
};

export { setupApiClient };
