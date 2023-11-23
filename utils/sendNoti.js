const axios = require('axios');

let allAgruments = {
  CHAT_ID: 'oc_46be266ca4897519f1bd56b96c0b430e',
  APP_ID: '',
  APP_SECRET: '',
  PROJECT_NAME: 'Facebook_UID_Scan',
  BUILD_RESULT: '',
  CURRENT_ENV: '',
};
process.argv.forEach(function (val, index, array) {
  if (val.includes('=')) {
    val = val.split('=');
    if (allAgruments.hasOwnProperty(val[0])) {
      allAgruments[val[0]] = val[1];
    }
  }
});
Object.keys(allAgruments).map((eachKey) => {
  if (!allAgruments[eachKey]) {
    throw new Error(`Missing ${eachKey}`);
  }
});

async function getTenantToken() {
  var data = JSON.stringify({
    app_id: allAgruments.APP_ID,
    app_secret: allAgruments.APP_SECRET,
  });

  var config = {
    method: 'post',
    url: 'https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal',
    headers: {
      'Content-Type': 'application/json',
    },
    data: data,
  };
  let result = await axios(config);
  return result.data;
}
async function sendMessage(chatId, token) {
  var data = JSON.stringify({
    chat_id: chatId,
    msg_type: 'interactive',
    card: {
      config: {
        wide_screen_mode: true,
      },
      elements: [
        {
          tag: 'div',
          fields: [
            {
              is_short: true,
              text: {
                tag: 'lark_md',
                content: `**🗳 Cập nhật ứng dụng：**\n${allAgruments.PROJECT_NAME}`,
              },
            },
            {
              is_short: true,
              text: {
                tag: 'lark_md',
                content: `**🏴 Môi trường：**\n${allAgruments.CURRENT_ENV}`,
              },
            },
          ],
        },
        {
          tag: 'hr',
        },
        {
          tag: 'div',
          fields: [
            {
              is_short: true,
              text: {
                tag: 'lark_md',
                content: `**☀ Trạng thái：**\n${allAgruments.BUILD_RESULT}`,
              },
            },
            {
              is_short: true,
              text: {
                tag: 'lark_md',
                content: `**⌚ Thời gian：**\n${new Date().toLocaleTimeString()} ${new Date().toLocaleDateString()} [Xem log](https://jenkins.kikisoftware.info/job/Extensions/job/AdsCheck/lastBuild/console)`,
              },
            },
          ],
        },
      ],
    },
  });

  var config = {
    method: 'post',
    url: 'https://open.larksuite.com/open-apis/message/v4/send',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: data,
  };

  let result = await axios(config);
  return result.data;
}
getTenantToken().then((res) => {
  let { tenant_access_token } = res;
  sendMessage(allAgruments.CHAT_ID, tenant_access_token).then((res) => {
    console.log(res);
  });
});
