export const chatState = {
    totalData: [],
    totalOrders: [],
    uploadSliderBtn: true,
    imageUpload: false,
    sliderImages: [],
  };
  
  export const chatReducer = (state, action) => {
    switch (action.type) {
      case "totalData":
        return {
          ...state,
          totalData: action.payload,
        };
      case "totalOrders":
        return {
          ...state,
          totalOrders: action.payload,
        };
      case "uploadSliderBtn":
        return {
          ...state,
          uploadSliderBtn: action.payload,
        };
      case "imageUpload":
        return {
          ...state,
          imageUpload: action.payload,
        };
      case "sliderImages":
        return {
          ...state,
          sliderImages: action.payload,
        };
      default:
        return state;
    }
  };
  