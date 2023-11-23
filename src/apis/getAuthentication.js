const { toast } = require('react-toastify');

const getCookies = async () => {
  return new Promise((resolve, reject) => {
    let cookieToken = '';
    chrome.cookies.getAll(
      {
        url: 'https://www.facebook.com',
      },
      (cookies) => {
        if (!cookies) {
          reject(
            toast.error('Lỗi lấy cookie !', {
              position: 'top-right',
              autoClose: false,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: 'colored',
            })
          );
        }
        console.log('cookies', cookies);
        for (let e of cookies) {
          cookieToken += e.name + '=' + e.value + ';';
        }
        resolve(cookieToken);
      }
    );
  });
};

const getFacebookData = async (id) => {
  try {
    let data = await fetch(`https://www.facebook.com/${id}`, {
      referrerPolicy: 'strict-origin-when-cross-origin',
      body: null,
      method: 'GET',
      mode: 'cors',
    }).then((result) => result.text());

    let dtsgCodeBlock = data
      .match(/{"token":"[A-Za-z0-9:_-]+"}/gim)
      ?.find((token) => /:/gim.test(token));
    return {
      username: data
        .match(/<title>?.*<\/title>/)[0]
        .slice(7, -8)
        .split('|')[0],
      fbDtsg: JSON.parse(dtsgCodeBlock).token,
    };
  } catch (err) {
    console.log(err);
    toast.error('Lỗi lấy thông tin tài khoản !', {
      position: 'top-right',
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'colored',
    });
    // throw new Error('Lỗi lấy thông tin tài khoản');
  }
};

const getAuthentication = async () => {
  try {
    let cookie = await getCookies();

    let adAccountId = await fetch(
      'https://www.facebook.com/adsmanager/manage/campaigns',
      {
        headers: {
          accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
          'accept-language':
            'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7,en-AU;q=0.6,en-NZ;q=0.5',
          'cache-control': 'max-age=0',
          'sec-ch-prefers-color-scheme': 'light',
          'sec-ch-ua':
            '"Google Chrome";v="105", "Not)A;Brand";v="8", "Chromium";v="105"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'document',
          'sec-fetch-mode': 'navigate',
          'sec-fetch-site': 'same-origin',
          'sec-fetch-user': '?1',
          'upgrade-insecure-requests': '1',
          'viewport-width': '1229',
        },
        referrerPolicy: 'origin-when-cross-origin',
        body: null,
        method: 'GET',
        mode: 'cors',
        redirect: 'follow',
        cookie: cookie,
      }
    )
      .then((result) => result.text())
      .then((data) => {
        return data
          .trim()
          .match(/act=[0-9]*\&/)[0]
          .slice(4, -1);
      });

    let accessTokenData = await fetch(
      `https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=${adAccountId}&breakdown_regrouping=0&nav_source=no_referrer`,
      {
        headers: {
          accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
          'accept-language':
            'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7,en-AU;q=0.6,en-NZ;q=0.5',
          'cache-control': 'max-age=0',
          'sec-ch-prefers-color-scheme': 'light',
          'sec-ch-ua':
            '"Google Chrome";v="105", "Not)A;Brand";v="8", "Chromium";v="105"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'document',
          'sec-fetch-mode': 'navigate',
          'sec-fetch-site': 'same-origin',
          'sec-fetch-user': '?1',
          'upgrade-insecure-requests': '1',
          'viewport-width': '1229',
        },
        referrer: 'https://www.facebook.com/adsmanager/manage/campaigns',
        referrerPolicy: 'origin-when-cross-origin',
        body: null,
        method: 'GET',
        mode: 'cors',
        cookie: cookie,
      }
    ).then((result) => result.text());

    console.log('accessTokenData', accessTokenData);
    if (!accessTokenData.includes('EAAB')) {
      accessTokenData = await fetch(
        `https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=${adAccountId}&breakdown_regrouping=1&nav_source=no_referrer`,
        {
          referrer: 'https://www.facebook.com/adsmanager/manage/campaigns',
          referrerPolicy: 'origin-when-cross-origin',
          body: null,
          method: 'GET',
          mode: 'cors',
          cookie: cookie,
        }
      ).then((result) => result.text());
    }

    let accessToken = accessTokenData.match(/EAAB.*?\"/)?.[0]?.slice(0, -1);
    console.log({ accessToken, adAccountId, cookie });
    return { cookie: cookie, accessToken: accessToken };
  } catch (e) {
    console.log(e);
    toast.error('Lỗi lấy cookie, mã truy cập facebook !', {
      position: 'top-right',
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'colored',
    });
    // throw new Error('Lỗi lấy cookie, mã truy cập facebook');
  }
};

const getInformationAccount = async () => {
  let { cookie, accessToken } = await getAuthentication();

  if (!(cookie || accessToken)) {
    localStorage.clear();
    toast.error('Lỗi lấy cookie, mã truy cập facebook !', {
      position: 'top-right',
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'colored',
    });
    // throw new Error('Lỗi lấy cookie, mã truy cập facebook');
  }
  let cUser;
  try {
    cUser = cookie.match(/[0-9]{15}/)[0];
  } catch (err) {
    cUser = cookie.match(/c_user=(.*?);/)?.[1];
  }
  if (!cUser) return {};
  let { username, fbDtsg } = await getFacebookData(cUser);

  localStorage.cookie = cookie;
  localStorage.accessToken = accessToken;
  localStorage.username = username;
  localStorage.user_id = cUser;
  localStorage.fb_dtsg = fbDtsg;

  return { cookie, accessToken, username, cUser, fbDtsg };
};

module.exports = {
  getInformationAccount,
  getAuthentication,
};
