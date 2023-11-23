import React from 'react';
import { ToastContainer, toast } from 'react-toastify';

const CustomToast = () => {
  const notify = () => {
    toast.success('Thông báo từ custom component!', {
      position: toast.POSITION.TOP_RIGHT,
    });
  };

  return (
    <div>
      <button onClick={notify}>Hiển thị thông báo</button>
      <ToastContainer />
    </div>
  );
};

export default CustomToast;
