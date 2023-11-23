import AdsClickIcon from '@mui/icons-material/AdsClick';
import CachedIcon from '@mui/icons-material/Cached';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import HistoryIcon from '@mui/icons-material/History';
import SaveIcon from '@mui/icons-material/Save';
import StopIcon from '@mui/icons-material/Stop';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import axios from 'axios';
import copy from 'clipboard-copy';
import { useFormik } from 'formik';
import React, { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import getAccessToken from '../../apis/authBase';
import Input from '../../components/Input';
import { splitData } from './Newtab';

const STATUS = {
  START: 'Bắt đầu quét',
  PROCESSING: 'Processing...',
  PAUSE: 'Dừng',
  FAIL: 'Lỗi khi quét',
  DONE: 'Thành công',
  EXPORT: 'Xuất dữ liệu',
  EXPORTING_FILE: 'Đang xuất dữ liệu...',
  EXPORTED_FILE: 'Dữ liệu đã xuất',
};

const RESPONE_STATUS = {
  SUCCESS: 'success',
  NOT_EXIST: 'NOTEXIST',
};

export const REPORT_BUG = {
  BLOCKED: 'Rate limit exceeded',
};

const ReelsScan = () => {
  const [buttonText, setButtonText] = useState(STATUS.START);
  const [buttonExport, setButtonExport] = useState(STATUS.EXPORT);
  const [commentQty, setCommentQty] = useState(0);
  const [endCursorReels, setEndCursorReels] = useState('');
  const [hasNextPage, setHasNextPage] = useState(true);
  const [profileData, setProfileData] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [showCursor, setShowCursor] = useState(false);
  const [paramsCurrent, setParamsCurrent] = useState({
    endCursorReels: '',
    hasNextPage: true,
    profileData: [],
  });

  const stopCall = useRef(false);
  const currentQty = useRef(0);

  const getConfig = localStorage.getItem('config');
  const config = JSON.parse(getConfig);

  const formik = useFormik({
    initialValues: {
      appKey: '' || config?.appKey,
      appSecretKey: '' || config?.appSecretKey,
      baseId: '' || config?.baseId,
      tableId: '' || config?.tableId,
    },
    validationSchema: Yup.object({
      baseId: Yup.string().required('Bạn cần điền vào phần này'),
      tableId: Yup.string().required('Bạn cần điền vào phần này'),
      appKey: Yup.string().required('Bạn cần điền vào phần này'),
      appSecretKey: Yup.string().required('Bạn cần điền vào phần này'),
    }),
    onSubmit: async (values) => {
      setButtonExport(STATUS.EXPORTING_FILE);
      const baseId = values.baseId;
      const table = values.tableId;
      const postUrl = `https://open.larksuite.com/open-apis/bitable/v1/apps/${baseId}/tables/${table}/records/batch_create`;

      const accessToken = await getAccessToken(
        values.appKey,
        values.appSecretKey,
        setButtonExport
      );
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      };

      //post Data
      const sendDataInChunks = async (data, postUrl, headers) => {
        const chunkedData = splitData(data, 999);
        let countLoops = 0;
        let checkResponse = true;
        for (const chunk of chunkedData) {
          const postData = {
            records: chunk.map((item) => {
              return {
                fields: {
                  uid: item.uid,
                  user_name: item.user_name,
                  profile_url: item.profile_url,
                  Link_Gốc: inputValue,
                },
              };
            }),
          };
          try {
            const response = await axios.post(postUrl, postData, {
              headers,
            });
            if (response.data.msg === RESPONE_STATUS.SUCCESS) {
              console.log('success');
            } else if (
              response.data.msg === RESPONE_STATUS.NOT_EXIST ||
              response.data.errors
            ) {
              console.log('Unable to export data. Recheck the configuration !');
              checkResponse = false;
              break;
            } else {
              checkResponse = false;
            }
          } catch (error) {
            checkResponse = false;
            break;
          }
          countLoops++;
        }
        if (countLoops === chunkedData.length && checkResponse) {
          if (profileData.length > 999) {
            setTimeout(() => {
              toast.success('Xuất dữ liệu thành công !', {
                position: 'top-right',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'colored',
              });
              setButtonExport(STATUS.EXPORT);
            }, 10000);
          } else {
            toast.success('Xuất dữ liệu thành công !', {
              position: 'top-right',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: 'colored',
            });
            setButtonExport(STATUS.EXPORT);
          }
        } else {
          toast.error(
            'Không thể xuất dữ liệu. Kiểm tra cấu hình và thử lại !',
            {
              position: 'top-right',
              autoClose: false,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: 'colored',
            }
          );
          setButtonExport(STATUS.EXPORT);
        }
      };

      const filteredData = profileData.map((items) => {
        return {
          uid: items.node.author.id,
          user_name: items.node.author.name,
          profile_url: items.node.author.url,
          Link_Gốc: inputValue,
        };
      });
      sendDataInChunks(filteredData, postUrl, headers);
    },
  });
  const clickButtonGetProfile = async (paramsCurrent) => {
    setButtonText(STATUS.PROCESSING);

    let { endCursorReels, hasNextPage, profileData } = paramsCurrent;
    let feedBackId;
    const fbDtsg = localStorage.getItem('fb_dtsg');

    const checkInputValue = /https:\/\/www.facebook.com\/reel\/*/;
    const checkUrlFBMobile = /https:\/\/mbasic.facebook.com\/reel\/*/;

    if (checkInputValue.test(inputValue) || checkUrlFBMobile.test(inputValue)) {
      try {
        const res = await axios.get(inputValue, {
          headers: {
            accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          },
        });
        const resData = res.data;
        //get feedbackID
        const regex =
          /"feedback":\s*{\s*"associated_group":\s*null,\s*"id":\s*"([^"]+)"/;
        const match = resData.match(regex);
        if (match) {
          const getId = match[1];
          feedBackId = getId;
        } else {
          console.log('No match found');
        }

        const headers = {
          'Content-Type': 'application/x-www-form-urlencoded',
        };
        const body = {
          fb_dtsg: fbDtsg,
          variables: `{"commentsIntentToken":"RANKED_UNFILTERED_CHRONOLOGICAL_REPLIES_INTENT_V1","feedLocation":"COMET_MEDIA_VIEWER","feedbackSource":65,"focusCommentID":null,"scale":1.5,"useDefaultActor":false,"id":"${feedBackId}"}`,
          doc_id: '6473655839405650',
        };

        if (endCursorReels === '') {
          const fisrtFetch = await axios.post(
            'https://www.facebook.com/api/graphql/',
            body,
            { headers }
          );
          const resFirst = fisrtFetch.data;
          if (typeof resFirst === 'string') {
            const regexEndCursor = /"end_cursor":"([^"]*)"/;
            const matchCursor = resFirst.match(regexEndCursor);
            endCursorReels = matchCursor[1];
          } else {
            profileData = profileData.concat(
              resFirst.data.node.comment_rendering_instance_for_feed_location
                .comments.edges
            );
            endCursorReels =
              resFirst.data.node.comment_rendering_instance_for_feed_location
                .comments.page_info.end_cursor;
          }
        }
      } catch (error) {
        toast.error('Không thể lấy ID Reel. Vui lòng thử lại !', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'colored',
        });
        console.log('Feching data fail:', error);
      }
    } else {
      setButtonText(STATUS.START);
      toast.error('Vui lòng nhập đúng định dạng của Reel !', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
      });
    }

    while (hasNextPage && !stopCall.current) {
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
      };
      const body = {
        fb_dtsg: fbDtsg,
        variables: `{"commentsAfterCount":-1,"commentsAfterCursor":"${endCursorReels}","commentsBeforeCount":null,"commentsBeforeCursor":null,"commentsIntentToken":"RANKED_UNFILTERED_CHRONOLOGICAL_REPLIES_INTENT_V1","feedLocation":"COMET_MEDIA_VIEWER","focusCommentID":null,"scale":1.5,"useDefaultActor":false,"id":"${feedBackId}"}`,
        doc_id: '7357690967641074',
      };
      try {
        const response = await axios.post(
          'https://www.facebook.com/api/graphql/',
          body,
          { headers }
        );
        const responseData = response.data;
        if (typeof responseData === 'string') {
          setButtonText(STATUS.PROCESSING);
          const regexEndCursor = /"end_cursor":"([^"]*)"/;
          const matchCursor = responseData.match(regexEndCursor);
          endCursorReels = matchCursor[1];
          continue;
        }

        if (responseData.errors) {
          setEndCursorReels(endCursorReels);

          setHasNextPage(false);
          if (responseData.errors[0].message === REPORT_BUG.BLOCKED) {
            setButtonText(STATUS.FAIL);
            toast.error(
              'Bạn tạm thời bị chặn tính năng này. Hãy xuất dữ liệu và dùng profile khác để tiếp tục sử dụng !',
              {
                position: 'top-right',
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
            toast.error('Lỗi máy chủ. Vui lòng thử lại với tài khoản khác', {
              position: 'top-right',
              autoClose: false,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: 'colored',
            });
            setButtonText(STATUS.FAIL);
          }
          break;
        } else if (
          responseData.data.node.comment_rendering_instance_for_feed_location
            .comments.edges.length === 0
        ) {
          toast.warning('Bài viết chưa có dữ liệu. Thử với bài viết khác', {
            position: 'top-right',
            autoClose: false,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'colored',
          });
          setButtonText(STATUS.START);
          break;
        } else {
          profileData = profileData.concat(
            responseData.data.node.comment_rendering_instance_for_feed_location
              .comments.edges
          );
          setProfileData(profileData);
          setCommentQty(currentQty.current + profileData.length);
          if (
            !responseData.data.node.comment_rendering_instance_for_feed_location
              .comments.page_info.has_next_page
          ) {
            toast.success('Quét dữ liệu thành công !', {
              position: 'top-right',
              autoClose: false,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: 'colored',
            });
            setHasNextPage(false);
            setButtonText(STATUS.DONE);
            break;
          } else {
            endCursorReels =
              responseData.data.node
                .comment_rendering_instance_for_feed_location.comments.page_info
                .end_cursor;
            setEndCursorReels(endCursorReels);
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        toast.error('Không thể quét dữ liệu. Vui lòng thử lại !', {
          position: 'top-right',
          autoClose: false,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'colored',
        });
        setButtonText(STATUS.FAIL);
        console.log('Error fetching data:', error);
        break;
      }
    }
  };

  const handleStop = () => {
    stopCall.current = true;
    setButtonText(STATUS.PAUSE);
    setParamsCurrent({
      ...paramsCurrent,
      endCursorReels,
      hasNextPage,
      profileData,
    });
  };

  const handleContinue = () => {
    stopCall.current = false;
    clickButtonGetProfile(paramsCurrent);
  };

  const handleSave = () => {
    localStorage.setItem('config', JSON.stringify(formik.values));
    toast.success('Lưu cấu hình thành công !', {
      position: 'top-right',
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'colored',
    });
  };
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleInputCursor = (event) => {
    setParamsCurrent({
      ...paramsCurrent,
      endCursorReels: event.target.value,
    });
  };

  const clickCoppy = async () => {
    try {
      await copy(endCursorReels);
      toast.success('Sao chép giá trị thành công', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
      });
    } catch (error) {
      console.error('Error copying to clipboard', error);
    }
  };
  const clickScanContinue = () => {
    setShowCursor(true);
  };
  return (
    <>
      <div className="block mx-48">
        <div>
          <TextField
            required
            fullWidth
            disabled={
              buttonText === STATUS.PROCESSING || buttonText === STATUS.PAUSE
            }
            label="Nhập link reels"
            id="linkpost"
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Nhập link reels..."
          />
        </div>
        <div className="my-6">
          {showCursor && (
            <TextField
              required
              fullWidth
              disabled={
                buttonText === STATUS.PROCESSING || buttonText === STATUS.PAUSE
              }
              label="Nhập giá trị đã sao chép"
              id="cursorPost"
              type="text"
              value={paramsCurrent.endCursorReels}
              onChange={handleInputCursor}
              placeholder="Nhập giá trị sao chép trước đó..."
            />
          )}
        </div>
        {buttonText === STATUS.START && (
          <>
            <Button
              variant="contained"
              className="m-5 p-6"
              disabled={!inputValue.trim()}
              onClick={() => clickButtonGetProfile(paramsCurrent)}
              startIcon={<AdsClickIcon />}
            >
              {buttonText}
            </Button>
            <Button
              variant="contained"
              className="m-5 p-6"
              onClick={clickScanContinue}
              startIcon={<HistoryIcon />}
            >
              Quét tiếp dữ liệu
            </Button>
          </>
        )}
        {(buttonText === STATUS.PROCESSING || buttonText === STATUS.PAUSE) && (
          <div>
            <Button
              variant="contained"
              className="m-5 p-6"
              onClick={handleStop}
              startIcon={<StopIcon />}
              disabled={buttonText === STATUS.FAIL}
            >
              Dừng
            </Button>
            <Button
              variant="contained"
              className="m-5 p-6"
              onClick={handleContinue}
              disabled={buttonText === STATUS.PROCESSING}
              startIcon={<CachedIcon />}
            >
              Tiếp Tục
            </Button>
          </div>
        )}
        {buttonText === STATUS.PROCESSING && (
          <div className="lds-spinner">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        )}
        <div className="show-cursor text-left">
          {buttonText === STATUS.FAIL && profileData.length > 0 && (
            <>
              <p className="text-red-600">
                Sao chép giá trị dưới đây để sử dụng trên profile khác
              </p>
              <div className="flex items-center space-x-2">
                <TextField
                  fullWidth
                  className="border p-2 rounded"
                  disabled
                  id="linkpost"
                  type="text"
                  value={endCursorReels}
                />
                <Button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  variant="contained"
                  onClick={clickCoppy}
                >
                  <ContentCopyIcon />
                </Button>
              </div>
            </>
          )}
        </div>
        {profileData.length > 0 && (
          <div>
            <p className="text-green-600 text-2xl mt-2">
              {buttonText === STATUS.DONE || buttonText === STATUS.PAUSE
                ? `Tổng UIDs quét được: ${commentQty}`
                : `
          Đã quét được: ${commentQty} UIDs
      `}
            </p>
          </div>
        )}
      </div>
      {(buttonText === STATUS.DONE ||
        buttonText === STATUS.PAUSE ||
        buttonText === STATUS.FAIL) &&
        profileData.length > 0 && (
          <form onSubmit={formik.handleSubmit} className="relative my-5 mx-44">
            <div className="m-4">
              <p className="text-purple-700 text-xl font-medium">
                Cấu hình lưu dữ liệu
              </p>
              <Input
                disabled={buttonExport === STATUS.EXPORTING_FILE}
                required
                type="text"
                name="appKey"
                value={formik.values.appKey}
                onChange={formik.handleChange}
                title="App ID:"
                placeholder="Enter Your App ID"
                errors={formik.errors.appKey || formik.touched.appKey}
              />
              <Input
                disabled={buttonExport === STATUS.EXPORTING_FILE}
                required
                type="text"
                name="appSecretKey"
                value={formik.values.appSecretKey}
                onChange={formik.handleChange}
                title="App Secret Key:"
                placeholder="Enter Your App Secret Key"
                errors={
                  formik.errors.appSecretKey || formik.touched.appSecretKey
                }
              />
              <Input
                disabled={buttonExport === STATUS.EXPORTING_FILE}
                required
                type="text"
                name="baseId"
                value={formik.values.baseId}
                onChange={formik.handleChange}
                title="Base ID:"
                placeholder="Enter Your Base ID"
                errors={formik.errors.baseId || formik.touched.baseId}
              />
              <Input
                disabled={buttonExport === STATUS.EXPORTING_FILE}
                required
                type="text"
                name="tableId"
                value={formik.values.tableId}
                onChange={formik.handleChange}
                title="Table ID:"
                placeholder="Enter Your Table ID"
                errors={formik.errors.tableId || formik.touched.tableId}
              />
            </div>
            <div className="text-purple-700 font-normal text-sm m-4">
              <p>
                Bạn cần tạo một file Base trên{' '}
                <span className="text-blue-500">Larksuite</span> với 3 cột: uid,
                user_name, profile_url, Link_Gốc và loại cột là "Văn bản"
              </p>
            </div>
            <div className="flex justify-center">
              <Button
                variant="contained"
                className="m-4 p-5"
                disabled={buttonExport === STATUS.EXPORTING_FILE}
                type="submit"
                startIcon={<DownloadIcon />}
              >
                {buttonExport}
              </Button>
              <Button
                variant="contained"
                className="m-4 p-5"
                disabled={buttonExport === STATUS.EXPORTING_FILE}
                onClick={handleSave}
                type="button"
                startIcon={<SaveIcon />}
              >
                Lưu Cấu Hình
              </Button>
            </div>
            {buttonExport === STATUS.EXPORTING_FILE && (
              <div className="lds-spinner-exporting">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
            )}
          </form>
        )}
    </>
  );
};

export default ReelsScan;
