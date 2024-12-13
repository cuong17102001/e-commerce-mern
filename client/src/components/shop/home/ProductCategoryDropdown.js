import React, { Fragment, useContext, useState, useEffect, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { HomeContext } from "./index";
import { getAllCategory } from "../../admin/categories/FetchApi";
import { getAllProduct, productByPrice } from "../../admin/products/FetchApi";
import { debounce, filter, wrap } from 'lodash';
import "./style.css";

const apiURL = process.env.REACT_APP_API_URL;

const CategoryList = () => {
  const history = useHistory();
  const { data, dispatch } = useContext(HomeContext);
  const { products, queryProductPayload } = data;
  const [categories, setCategories] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      let responseData = await getAllCategory();
      if (responseData && responseData.Categories) {
        setCategories(responseData.Categories);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchDataProductByCategory = async (cId) => {
    try {
      dispatch({ type: "loading", payload: true });      
      let payload = {
        ...queryProductPayload,
        pageNumber: 1,
      };

      if (cId !== "") {
        payload.filter = { ...payload.filter, category: cId };
      }
      let responseData = await getAllProduct(payload);
      if (responseData && responseData.Products) {
        dispatch({ type: "setProducts", payload: responseData.Products });
        dispatch({ type: "queryProductPayload", payload });
      }
    } catch (error) {
      console.log(error);
    }
    finally {
      dispatch({ type: "loading", payload: false });
    }
  };

  return (
    <div className={`${data.categoryListDropdown ? "" : "hidden"} my-4`}>
      <hr />
      {/* wrap content */}
      <div className="flex" style={{ flexWrap: "wrap"}}>
        {categories && categories.length > 0 ? (
          categories.map((item, index) => {
            return (
              <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}} key={index}>
                <div
                  onClick={(e) =>
                    fetchDataProductByCategory(item._id)
                  }
                  className="flex flex-col items-center justify-center space-y-2 cursor-pointer"
                >
                  <div style={{ padding: 15 }} className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">{item.cName}</div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-xl text-center my-4">No Category</div>
        )}
      </div>
    </div>
  );
};

const FilterList = () => {
  const { data, dispatch } = useContext(HomeContext);
  const [range, setRange] = useState(0);
  const { products, queryProductPayload } = data;
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const rangeHandle = (e) => {
    setRange(e.target.value);
    fetchData(e.target.value);
  };

  const fetchData = async (price, isLoadMore = false) => {
    if (!isLoadMore) dispatch({ type: "loading", payload: true });

    try {
      let payload = {
        ...queryProductPayload,
        pageNumber: isLoadMore
          ? (queryProductPayload?.pageNumber || 0) + 1
          : 1,
        filter: { ...filter, price: price }
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

  const closeFilterBar = () => {
    fetchData("all");
    dispatch({ type: "filterListDropdown", payload: !data.filterListDropdown });
    setRange(0);
  };

  return (
    <div className={`${data.filterListDropdown ? "" : "hidden"} my-4`}>
      <hr />
      <div className="w-full flex flex-col">
        <div className="font-medium py-2">Filter by price</div>
        <div className="flex justify-between items-center">
          <div className="flex flex-col space-y-2  w-2/3 lg:w-2/4">
            <label htmlFor="points" className="text-sm">
              Price (between 0 and 1.000.000vnđ):{" "}
              <span className="font-semibold text-yellow-700">{range.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}vnđ</span>{" "}
            </label>
            <input
              value={range}
              className="slider"
              type="range"
              id="points"
              min="0"
              max="1000000"
              step="1000"
              onChange={(e) => rangeHandle(e)}
            />
          </div>
          <div onClick={(e) => closeFilterBar()} className="cursor-pointer">
            <svg
              className="w-8 h-8 text-gray-700 hover:bg-gray-200 rounded-full p-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

const Search = () => {
  const { data, dispatch } = useContext(HomeContext);
  const [search, setSearch] = useState("");
  const { products, queryProductPayload } = data;
  const [productArray, setPa] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');

  // const searchHandle = async (e) => {
  //   setSearch(e.target.value);
  //   await fetchData();
  //   // dispatch({
  //   //   type: "searchHandleInReducer",
  //   //   payload: e.target.value,
  //   //   productArray: productArray,
  //   // });
  // };

  useEffect(() => {
    // Set up a timeout to update the debounced value
    const handler = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, 1000); // 1 second debounce

    // Cleanup the timeout if inputValue changes before the timeout is executed
    return () => {
      clearTimeout(handler);
    };
  }, [inputValue]);

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  useEffect(() => {
    if (debouncedValue) {
      fetchData(debouncedValue);
    }
  }, [debouncedValue]);

  const searchHandle = (e) => {
    // stop 1s before search
    // setSearch(e.target.value);
    debounce(fetchData(e.target.value), 1000);
  };

  const fetchData = async (value) => {
    dispatch({ type: "loading", payload: true });
    try {
      let payload = {
        ...queryProductPayload,
        pageNumber: 1,
      };
      if (value !== "") {
        payload.search = value;
      }

      let responseData = await getAllProduct(payload);
      if (responseData && responseData.Products) {
        dispatch({
          type: "setProducts",
          payload: [...data.products ?? [], ...responseData.Products],
        });
        dispatch({ type: "queryProductPayload", payload });
        dispatch({ type: "loading", payload: false });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const closeSearchBar = () => {
    dispatch({ type: "searchDropdown", payload: !data.searchDropdown });
    fetchData();
    dispatch({ type: "setProducts", payload: productArray });
    setSearch("");
  };

  return (
    <div
      className={`${data.searchDropdown ? "" : "hidden"
        } my-4 flex items-center justify-between`}
    >
      <input
        value={inputValue}
        onChange={handleChange}
        className="px-4 text-xl py-4 focus:outline-none"
        type="text"
        placeholder="Search products..."
      />
      <div onClick={(e) => closeSearchBar()} className="cursor-pointer">
        <svg
          className="w-8 h-8 text-gray-700 hover:bg-gray-200 rounded-full p-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>
    </div>
  );
};

const ProductCategoryDropdown = (props) => {
  return (
    <Fragment>
      <CategoryList />
      <FilterList />
      <Search />
    </Fragment>
  );
};

export default ProductCategoryDropdown;
