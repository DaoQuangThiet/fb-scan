import React from 'react';
import { useDependentFetch } from '../hooks/useFetch';
import { getCookies } from '../apis/cookies';
import { setSession } from '../../utils/session';
import { getAccessToken, getActId } from '../apis/auth';

const CookieInfo = () => {
  const { data, isLoading } = useDependentFetch([getCookies, setSession]);
  const { data: accessTokenData, isLoading: loadingAccessToken } =
    useDependentFetch([getActId, getAccessToken], {
      onError: (err) => {
        console.log({ err });
      },
    });
  
  const [cookie] = data || [];
  const [accountId, accessToken] = accessTokenData || [];


  return (
    <div>
      <p>
        This is Cookie: <strong>{cookie}</strong>
      </p>
      <p>
        This is ActId: <strong>{accountId}</strong>
      </p>
      <p>
        This is accessToken: <strong>{accessToken}</strong>
      </p>
    </div>
  );
};

export default CookieInfo;
