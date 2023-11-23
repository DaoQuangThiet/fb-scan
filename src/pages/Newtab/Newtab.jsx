import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import { IconButton } from '@mui/material';
import Button from '@mui/material/Button';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getInformationAccount } from '../../apis/getAuthentication';
import LogoKiki from '../../assets/img/newkiki.png';
import Layout from '../../components/Layout';
import {
  KIKI_SERVER_API_ENDPOINT,
  SESSION_ID,
} from '../../libs/apollo/constant';
import FriendScan from './FriendScan';
import MemberScan from './MemberScan';
import PageInteractions from './PageInteractions';
import ReelsScan from './ReelsScan';
import './index.css';

const BUTTON_CONTENT = {
  DEFAULT: 'Extension Quét UID Facebook',
  GROUP: 'Quét thành viên nhóm',
  PAGE: 'Quét tương tác bài viết',
  FRIENDS: 'Quét danh sách bạn bè',
  REELS: 'Quét bình luận Reels',
};
//Function Chia mang thanh cac mang con
export const splitData = (data, arraySize) => {
  const results = [];
  while (data.length) {
    results.push(data.splice(0, arraySize));
  }
  return results;
};

const Newtab = () => {
  const [selected, setSelected] = useState(null);
  const [hideButton, setHideButton] = useState(true);
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

  const selectComponent = async (type) => {
    setSelected(type);
    setHideButton(false);
    console.log(KIKI_SERVER_API_ENDPOINT);
    console.log(SESSION_ID);
  };

  const renderComponent = () => {
    switch (selected) {
      case BUTTON_CONTENT.GROUP:
        return <MemberScan />;
      case BUTTON_CONTENT.PAGE:
        return <PageInteractions />;
      case BUTTON_CONTENT.FRIENDS:
        return <FriendScan />;
      case BUTTON_CONTENT.REELS:
        return <ReelsScan />;
      default:
        return null;
    }
  };

  const renderTitle = () => {
    switch (selected) {
      case BUTTON_CONTENT.GROUP:
        return BUTTON_CONTENT.GROUP;
      case BUTTON_CONTENT.PAGE:
        return BUTTON_CONTENT.PAGE;
      case BUTTON_CONTENT.FRIENDS:
        return BUTTON_CONTENT.FRIENDS;
      case BUTTON_CONTENT.REELS:
        return BUTTON_CONTENT.REELS;
      default:
        return BUTTON_CONTENT.DEFAULT;
    }
  };

  const clickHomeIcon = () => {
    setSelected(null);
    setHideButton(true);
  };

  return (
    <Layout>
      <div className="quangthiet p-4 bg-white text-blue-800 grid grid-cols-2 items-center">
        <div className="flex items-center">
          <img src={LogoKiki} className="w-16 h-16" alt="logo1" />
          <h2 className="text-center text-xl font-bold">{renderTitle()}</h2>
        </div>
        <div className="flex justify-end">
          <IconButton size="small" color="primary" onClick={clickHomeIcon}>
            <HomeIcon fontSize="large" />
          </IconButton>
        </div>
        {/* <img src={LogoFacebook} className="w-12 h-w-12" alt="logo2" /> */}
      </div>
      <div className="p-6 text-center m-4">
        {hideButton && (
          <div className="flex flex-col items-center">
            <Button
              disabled={checkFree}
              className="w-56 m-3 p-6"
              variant="contained"
              onClick={() => selectComponent(BUTTON_CONTENT.GROUP)}
              startIcon={<SearchIcon />}
            >
              {BUTTON_CONTENT.GROUP}
            </Button>
            <Button
              disabled={checkFree}
              className="w-56 m-3 p-6"
              variant="contained"
              onClick={() => selectComponent(BUTTON_CONTENT.PAGE)}
              startIcon={<SearchIcon />}
            >
              {BUTTON_CONTENT.PAGE}
            </Button>
            <Button
              disabled={checkFree}
              className="w-56 m-3 p-6"
              variant="contained"
              onClick={() => selectComponent(BUTTON_CONTENT.FRIENDS)}
              startIcon={<SearchIcon />}
            >
              {BUTTON_CONTENT.FRIENDS}
            </Button>
            <Button
              disabled={checkFree}
              className="w-56 m-3 p-6"
              variant="contained"
              onClick={() => selectComponent(BUTTON_CONTENT.REELS)}
              startIcon={<SearchIcon />}
            >
              {BUTTON_CONTENT.REELS}
            </Button>
          </div>
        )}
        {renderComponent()}
        <div className="text-lg">
          <ToastContainer />
        </div>
      </div>
    </Layout>
  );
};

export default Newtab;
