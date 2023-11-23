const getCookies = async () => {
  return new Promise((resolve, reject) => {
    let cookieToken = '';
    chrome.cookies.getAll(
      {
        url: 'https://www.facebook.com',
      },
      (cookies) => {
        if (!cookies) {
          reject(new Error('Error fetching data fail !!'));
        }
        for (let e of cookies) {
          cookieToken += e.name + '=' + e.value + ';';
        }
        resolve(cookieToken);
      }
    );
  });
};

export { getCookies };
