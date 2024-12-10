import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { LayoutContext } from "../layout";
import { useHistory } from "react-router-dom";
import { createOrder } from './FetchApi';

const VnpayReturn = () => {
  const location = useLocation();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const { data, dispatch } = useContext(LayoutContext);
  const history = useHistory();

  useEffect(() => {
    const fetchData = async () => {
      const params = queryString.parse(location.search);
      const vnp_ResponseCode = params.vnp_ResponseCode;

      if (vnp_ResponseCode === '00') {
        setPaymentStatus('success');
        let orderData = {
          allProduct: JSON.parse(localStorage.getItem("cart")),
          user: JSON.parse(localStorage.getItem("jwt")).user._id,
          amount: queryString.parse(location.search).vnp_Amount / 100,
          transactionId: queryString.parse(location.search).vnp_TransactionNo,
          address: queryString.parse(location.search).address,
          phone: queryString.parse(location.search).phone,
        };

        try {
          let responseData = await createOrder(orderData); // Sử dụng await
          if (responseData.success) {
            localStorage.setItem("cart", JSON.stringify([]));
            dispatch({ type: "cartProduct", payload: null });
            dispatch({ type: "cartTotalCost", payload: null });
            dispatch({ type: "orderSuccess", payload: true });
            dispatch({ type: "loading", payload: false });
          } else if (responseData.error) {
            console.log(responseData.error);
          }
        } catch (error) {
          console.log(error);
        }
      } else {
        setPaymentStatus('failure');
      }
    };

    fetchData();
  }, [location.search]);

  return (
    <div className="vnpay-return">
      <h1>Payment Status</h1>
      {paymentStatus === 'success' ? (
        <div className="payment-details">
          <h2>Payment Successful!</h2>
          <p>Transaction Number: {queryString.parse(location.search).vnp_TransactionNo}</p>
          <p>Amount: {queryString.parse(location.search).vnp_Amount / 100} VND</p>
          <button onClick={() => window.location.href = '/'}>Back to Home</button>
        </div>
      ) : (
        <div className="payment-details failed">
          <h2>Payment Failed</h2>
          <p>Please try again or contact support.</p>
          <button onClick={() => window.location.href = '/'}>Back to Home</button>
        </div>
      )}
    </div>
  );
};

export default VnpayReturn;
