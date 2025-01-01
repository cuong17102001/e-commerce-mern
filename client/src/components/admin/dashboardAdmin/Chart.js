import React, { Fragment, useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { getRevenue } from "./FetchApi";

const BarChart = ({ dataChart }) => {
  const options = {
    responsive: true,
    title: {
      display: true,
      text: "Revenue chart",
    },
    legend: {
      position: "top",
    },
  };

  return (
    <div style={{ width: "90%", margin: "50px auto" }}>
      <Line data={dataChart} options={options} />
    </div>
  );
};

const Chart = () => {
  const [dataChart, setDataChart] = useState({
    labels: [],
    datasets: [
      {
        label: "Revenue",
        data: [],
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        lineTension: 0.4,
      },
    ],
  });

  const fetchDataChart = async (option) => {
    try {
      const response = await getRevenue(option);
      console.log(response);

      const labels = response.revenue.map((item) => {
        if (item._id.day) {
          return `${item._id.day}/${item._id.month}/${item._id.year}`;
        } else if (item._id.month) {
          return `${item._id.month}/${item._id.year}`;
        } else {
          return item._id.year;
        }
      });

      const data = {
        labels: labels,
        datasets: [
          {
            label: "Revenue",
            data: response.revenue.map((item) => item.totalRevenue),
            borderColor: "rgba(75,192,192,1)",
            backgroundColor: "rgba(75,192,192,0.2)",
            lineTension: 0.4,
          },
        ],
      };

      setDataChart(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchDataChart("daily"); // Load dữ liệu mặc định
  }, []);

  return (
    <Fragment>
      <div className="m-4 grid grid-cols-1 md:grid-cols-1 row-gap-1 col-gap-1">
        <div className="flex flex-col justify-center items-center col-span-1 bg-white p-6 shadow-lg hover:shadow-none cursor-pointer transition-all duration-300 ease-in border-b-4 border-opacity-0 hover:border-opacity-100 border-indigo-200">
          <select
            onChange={(e) => fetchDataChart(e.target.value)}
            className="w-1/2 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
          >
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <BarChart dataChart={dataChart} />
        </div>
      </div>
    </Fragment>
  );
};

export default Chart;
