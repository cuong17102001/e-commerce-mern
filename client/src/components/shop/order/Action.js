
export const fetchData = async (cartListProduct, dispatch) => {
  dispatch({ type: "loading", payload: true });
  try {
    let responseData = await cartListProduct();
    if (responseData && responseData.Products) {
      setTimeout(function () {
        dispatch({ type: "cartProduct", payload: responseData.Products });
        dispatch({ type: "loading", payload: false });
      }, 1000);
    }
  } catch (error) {
    console.log(error);
  }
};

export const fetchbrainTree = async (getBrainTreeToken, setState) => {
  try {
    let responseData = await getBrainTreeToken();
    if (responseData && responseData) {
      setState({
        clientToken: responseData.clientToken,
        success: responseData.success,
      });
      console.log(responseData);
    }
  } catch (error) {
    console.log(error);
  }
};

export const pay = async (
  data,
  dispatch,
  state,
  setState,
  getUrlPaymentVnpay,
  totalCost,
  history
) => {
  if (!state.address) {
    setState({ ...state, error: "Please provide your address" });
  } else if (!state.phone) {
    setState({ ...state, error: "Please provide your phone number" });
  } else{
    dispatch({ type: "loading", payload: true });

    try {
      // Assuming paymentData is the data you need to send to getUrlPaymentVnpay
      let paymentData = {
        amount: totalCost(),
        orderDescription: state.orderDescription ?? "",
        orderType: "billpayment",
        address: state.address,
        phone: state.phone,
      };
  
      // Call the function to get the payment URL
      const result = await getUrlPaymentVnpay(paymentData);
  
      // Redirect to the VNPAY payment URL
      if (result && result.vnpUrl) {
        window.location.href = result.vnpUrl;
      }
    } catch (error) {
      console.error("Payment failed", error);
    } finally {
      dispatch({ type: "loading", payload: false });
    }  
  }
};
