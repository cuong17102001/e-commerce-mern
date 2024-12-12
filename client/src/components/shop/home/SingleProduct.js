import React, { Fragment, useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { getAllProduct } from "../../admin/products/FetchApi";
import { HomeContext } from "./index";
import { isWishReq, unWishReq, isWish } from "./Mixins";

const apiURL = process.env.REACT_APP_API_URL;

const SingleProduct = (props) => {
  const { data, dispatch } = useContext(HomeContext);
  const history = useHistory();
  const { products, queryProductPayload } = data;
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  /* WhisList State */
  const [wList, setWlist] = useState(
    JSON.parse(localStorage.getItem("wishList"))
  );

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const debounce = (func, delay) => {
      let timeout;
      return (...args) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
      };
    };

    const handleScroll = debounce(() => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 200 &&
        !loadingMore &&
        hasMore
      ) {
        setLoadingMore(true);
        fetchData(true); // Load more products
      }
    }, 200);

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadingMore, hasMore, queryProductPayload]);

  const fetchData = async (isLoadMore = false) => {
    if (!isLoadMore) dispatch({ type: "loading", payload: true });

    try {
      let payload = {
        ...queryProductPayload,
        pageNumber: isLoadMore
          ? (queryProductPayload?.pageNumber || 0) + 1
          : 1,
      };

      let responseData = await getAllProduct(payload);

      if (responseData && responseData.Products) {
        if (isLoadMore) {
          dispatch({
            type: "setProducts",
            payload: [...products, ...responseData.Products],
          });
        } else {
          dispatch({ type: "setProducts", payload: responseData.Products });
        }

        dispatch({ type: "queryProductPayload", payload });
        setHasMore(responseData.pagination.pageNumber * responseData.pagination.pageSize < responseData.pagination.totalCount); // Kiểm tra nếu còn dữ liệu để tải
      }
    } catch (error) {
      console.log(error);
    } finally {
      if (!isLoadMore) dispatch({ type: "loading", payload: false });
      setLoadingMore(false);
    }
  };

  if (data.loading) {
    return (
      <div className="col-span-2 md:col-span-3 lg:col-span-4 flex items-center justify-center py-24">
        <svg
          className="w-12 h-12 animate-spin text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          ></path>
        </svg>
      </div>
    );
  }
  return (
    <Fragment>
      {products && products.length > 0 ? (
        products.map((item, index) => (
          <Fragment key={index}>
            <div className="relative col-span-1 m-2">
              {/* Image Section */}
              <div className="image-container">
                <img
                  style={{
                    height: "100%",
                    margin: "auto",
                    alignItems: "center",
                    alignContent: "center",
                  }}
                  onClick={() => history.push(`/products/${item._id}`)}
                  src={`${apiURL}/uploads/products/${item.pImages[0]}`}
                  alt={item.pName}
                />
              </div>
              {/* Product Details */}
              <div className="flex items-center justify-between mt-2">
                <div className="text-gray-600 font-light truncate">
                  {item.pName}
                </div>
                <div className="flex items-center space-x-1">
                  <span>
                    <svg
                      className="w-4 h-4 fill-current text-yellow-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  </span>
                  <span className="text-gray-700">
                    {item.pRatingsReviews.length}
                  </span>
                </div>
              </div>
              <div>
                {item.pPrice
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}{" "}
                vnđ
              </div>
              {/* Wishlist Logic */}
              <div className="absolute top-0 right-0 mx-2 my-2 md:mx-4">
                <svg
                  onClick={(e) => isWishReq(e, item._id, setWlist)}
                  className={`${isWish(item._id, wList) && "hidden"
                    } w-5 h-5 md:w-6 md:h-6 cursor-pointer text-yellow-700 transition-all duration-300 ease-in`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <svg
                  onClick={(e) => unWishReq(e, item._id, setWlist)}
                  className={`${!isWish(item._id, wList) && "hidden"
                    } w-5 h-5 md:w-6 md:h-6 cursor-pointer text-yellow-700 transition-all duration-300 ease-in`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              {/* Wishlist Logic End */}
            </div>
          </Fragment>
        ))
      ) : (
        <div className="col-span-2 md:col-span-3 lg:col-span-4 flex items-center justify-center py-24 text-2xl">
          No Products Found
        </div>
      )}
    </Fragment>

  );
};

export default SingleProduct;
