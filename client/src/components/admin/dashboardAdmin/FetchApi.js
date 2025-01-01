import axios from "axios";
const apiURL = process.env.REACT_APP_API_URL;

export const DashboardData = async () => {
  try {
    let res = await axios.post(`${apiURL}/api/customize/dashboard-data`);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getSliderImages = async () => {
  try {
    let res = await axios.get(`${apiURL}/api/customize/get-slide-image`);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getRevenue = async (option) => {
  try {
    let res = await axios.post(`${apiURL}/api/product/get-revenue`,
      { statisticBy : option }
    );
    return res.data;
  } catch (error) {
    console.log(error);
  }
}

export const getAllUsers = async () => {
  try {
    let res = await axios.get(
      `${apiURL}/api/user/all-user`
    );
    return res.data;
  } catch (error) {
    console.log(error);
  }
}

export const getMessageByRoom = async (roomId) => {
  try {
    let res = await axios.post(
      `${apiURL}/api/user/get-message-by-room`,
      { roomId }
    );
    return res.data;
  } catch (error) {
    console.log(error);
  }
}

export const postUploadImage = async (formData) => {
  try {
    let res = await axios.post(
      `${apiURL}/api/customize/upload-slide-image`,
      formData
    );
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const postDeleteImage = async (id) => {
  try {
    let res = await axios.post(`${apiURL}/api/customize/delete-slide-image`, {
      id,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};
