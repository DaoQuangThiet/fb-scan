import axios from 'axios';
import { toast } from 'react-toastify';

const getAccessToken = async (appKey, appSecretKey, setButtonExport) => {
  const linkGetAccessToken =
    'https://open.larksuite.com/open-apis/auth/v3/app_access_token/internal';
  const body = {
    app_id: appKey,
    app_secret: appSecretKey,
  };
  try {
    const response = await axios.post(linkGetAccessToken, body);
    if (response?.data?.msg === 'ok') {
      const accessToken = response.data.tenant_access_token;
      return accessToken;
    } else if (
      response?.data?.msg === 'invalid param' ||
      response?.data?.msg === 'app secret invalid'
    ) {
      toast.error(
        'Token không hợp lệ để ủy quyền. Vui lòng kiểm tra lại "App ID" và "App Secret Key" !',
        {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'colored',
        }
      );
      console.log('Unable to get token. Check app key and app secret key');
    }
  } catch (error) {
    toast.error(`${error}`, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'colored',
    });
    console.log('Get Access Token Fail:', error);
  }
};

export default getAccessToken;
