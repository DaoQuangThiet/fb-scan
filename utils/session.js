import { http } from './http';

const setSession = async (cookie) => {
  if (cookie) {
    localStorage.setItem('cookie', cookie);
    http.facebookInstance.setCookie(cookie);
  } else {
    localStorage.removeItem('cookie');
    http.facebookInstance.clearAuthorization();
  }

  return Promise.resolve(cookie);
};

export { setSession };
