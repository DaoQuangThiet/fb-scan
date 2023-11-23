import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Button from '@mui/material/Button';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getInformationAccount } from '../../apis/getAuthentication';
import LogoFace from '../../assets/img/Facebook_Logo_2023.png';
import LogoKiki from '../../assets/img/newkiki.png';
import Layout from '../../components/Layout';
import {
  KIKI_SERVER_API_ENDPOINT,
  SESSION_ID,
} from '../../libs/apollo/constant';
import './index.css';

const Popup = () => {
  const [checkFree, setCheckFree] = useState(false);
  useEffect(() => {
    const checkPackage = async () => {
      try {
        const response = await axios.get(
          `${KIKI_SERVER_API_ENDPOINT}/statistic`,
          {
            headers: {
              Authorization: `${SESSION_ID}`,
            },
          }
        );
        console.log(response);
        if (response?.data?.data?.package?.name === 'Free') {
          setCheckFree(true);
          toast.error(
            'Nâng cấp lên một trong các gói cước: TEAM, SCALE, BUSINESS để tiếp tục sử dụng !',
            {
              position: 'top-center',
              autoClose: false,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: 'colored',
            }
          );
        } else {
          getInformationAccount();
        }
      } catch (error) {
        setCheckFree(true);
        toast.error('Bạn cần sử dụng ứng dụng KikiLogin để tiếp tục', {
          position: 'top-center',
          autoClose: false,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'colored',
        });
      }
    };
    checkPackage();
  }, []);

  const handleClickUse = async () => {
    chrome.tabs.create({
      url: 'NewTab.html',
    });
  };

  return (
    <Layout>
      <div className="p-4 bg-white text-blue-800 flex justify-between items-center">
        <img src={LogoKiki} className="w-14 h-14" alt="logo1" />
        <h2 className="text-center text-xl font-bold">
          Extension quét UID Facebook
        </h2>
        <img src={LogoFace} className="w-12 h-12" alt="logo1" />
      </div>
      <div className="p-6 text-center m-4">
        <div className="flex flex-col items-center">
          <Button
            className="w-56 m-3 p-6"
            variant="contained"
            disabled={checkFree}
            onClick={handleClickUse}
            startIcon={<OpenInNewIcon />}
          >
            Bắt đầu sử dụng
          </Button>
        </div>
        <div className="text-lg">
          <ToastContainer />
        </div>
      </div>
    </Layout>
  );
};

export default Popup;
