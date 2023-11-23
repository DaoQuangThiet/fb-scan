import {
  getAccessTokenFromHTMLDoc,
  getActIdFromHTMLDoc,
} from '../../utils/facebookHelpers';
import { HttpUtils, http } from '../../utils/http';

async function getActId() {
  return http.facebookInstance
    .getInstance()
    .get('/adsmanager/manage/campaigns')
    .then(HttpUtils.getDataFromHttpResponse)
    .then(getActIdFromHTMLDoc);
}

async function getAccessToken(actId) {
  return http.facebookInstance
    .getInstance()
    .get(
      `/adsmanager/manage/campaigns?act=${actId}&breakdown_regrouping=0&nav_source=no_referrer`
    )
    .then(HttpUtils.getDataFromHttpResponse)
    .then(getAccessTokenFromHTMLDoc);
}

export { getAccessToken, getActId };
