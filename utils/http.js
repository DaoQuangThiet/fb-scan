import axios from 'axios';

class Http {
  constructor(baseURL) {
    this.instance = axios.create({
      baseURL: baseURL,
    });
  }

  getInstance() {
    return this.instance;
  }

  setCookie(cookie) {
    this.instance.defaults.headers.common.Cookie = cookie;
  }

  clearAuthorization() {
    delete this.instance.defaults.headers.common.Cookie;
  }
}

export const http = {
  facebookInstance: new Http('https://www.facebook.com'),
};

export class HttpUtils {
  static getDataFromHttpResponse(response) {
    return response.data;
  }
}
