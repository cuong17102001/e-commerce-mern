const productModel = require("../models/products");
const fs = require("fs");
const path = require("path");
const FormData = require('form-data');
const axios = require('axios');
const { log } = require("console");
const orderModel = require("../models/orders");

class Product {
  // Delete Image from uploads -> products folder
  static deleteImages(images, mode) {
    var basePath = process.env.IMAGES_URL + "products/";
    console.log(basePath);
    for (var i = 0; i < images.length; i++) {
      let filePath = "";
      if (mode == "file") {
        filePath = basePath + `${images[i].filename}`;
      } else {
        filePath = basePath + `${images[i]}`;
      }
      console.log(filePath);
      if (fs.existsSync(filePath)) {
        console.log("Exists image");
      }
      fs.unlink(filePath, (err) => {
        if (err) {
          return err;
        }
      });
    }
  }

  async getAllProduct(req, res) {
    try {
      const { pageSize = 10, pageNumber = 1, search = "", filter = {} } = req.body;
  
      // Tạo điều kiện tìm kiếm dựa trên `search` và `filter`
      const query = {
        pName: { $regex: search, $options: "i" }, // Tìm kiếm không phân biệt chữ hoa, chữ thường
      };
      if (filter?.price) {
        query.pPrice = { $gte: 0, $lte: filter.price };
      }

      if (filter?.category) {
        query.pCategory = { $in: filter.category };
      }
  
      // Tính toán số lượng bản ghi cần bỏ qua (skip)
      const skip = (pageNumber - 1) * pageSize;
  
      // Truy vấn cơ sở dữ liệu với phân trang, tìm kiếm, và lọc
      const Products = await productModel
        .find(query)
        .populate("pCategory", "_id cName") // Lấy thông tin từ `pCategory`
        .sort({ _id: -1 }) // Sắp xếp theo thứ tự giảm dần của `_id`
        .skip(skip) // Bỏ qua các bản ghi đã xem
        .limit(pageSize); // Giới hạn số bản ghi trả về
  
      // Lấy tổng số bản ghi để hỗ trợ hiển thị tổng số trang
      const totalCount = await productModel.countDocuments(query);
  
      return res.json({
        Products,
        pagination: {
          pageSize,
          pageNumber,
          totalCount,
          filter,
          search,
          totalPages: Math.ceil(totalCount / pageSize),
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  

  async postAddProduct(req, res) {
    let { pName, pDescription, pPrice, pQuantity, pCategory, pOffer, pStatus } =
      req.body;
    let images = req.files;
    // Validation
    if (
      !pName |
      !pDescription |
      !pPrice |
      !pQuantity |
      !pCategory |
      !pOffer |
      !pStatus
    ) {
      Product.deleteImages(images, "file");
      return res.json({ error: "All filled must be required" });
    }
    // Validate Name and description
    else if (pName.length > 255 || pDescription.length > 3000) {
      Product.deleteImages(images, "file");
      return res.json({
        error: "Name 255 & Description must not be 3000 charecter long",
      });
    }
    // Validate Images
    else if (images.length < 2) {
      Product.deleteImages(images, "file");
      return res.json({ error: "Must need to provide 2 images" });
    } else {
      try {
        let allImages = [];
        for (const img of images) {
          allImages.push(img.filename);
        }
        console.log("==============", pCategory);
        let categories = pCategory.split(",");
        let newProduct = new productModel({
          pImages: allImages,
          pName,
          pDescription,
          pPrice,
          pQuantity,
          pCategory: categories,
          pOffer,
          pStatus,
        });

        console.log(newProduct);

        let save = await newProduct.save();
        if (save) {
          return res.json({ success: "Product created successfully" });
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  async postEditProduct(req, res) {
    let {
      pId,
      pName,
      pDescription,
      pPrice,
      pQuantity,
      pCategory,
      pOffer,
      pStatus,
      pImages,
    } = req.body;
    let editImages = req.files;

    // Validate other fileds
    if (
      !pId |
      !pName |
      !pDescription |
      !pPrice |
      !pQuantity |
      !pCategory |
      !pOffer |
      !pStatus
    ) {
      return res.json({ error: "All filled must be required" });
    }
    // Validate Name and description
    else if (pName.length > 255 || pDescription.length > 3000) {
      return res.json({
        error: "Name 255 & Description must not be 3000 charecter long",
      });
    }
    // Validate Update Images
    else if (editImages && editImages.length == 1) {
      Product.deleteImages(editImages, "file");
      return res.json({ error: "Must need to provide 2 images" });
    } else {
      let editData = {
        pName,
        pDescription,
        pPrice,
        pQuantity,
        pCategory: pCategory.split(","),
        pOffer,
        pStatus,
      };
      if (editImages.length >= 2) {
        let allEditImages = [];
        for (const img of editImages) {
          allEditImages.push(img.filename);
        }
        editData = { ...editData, pImages: allEditImages };
        Product.deleteImages(pImages.split(","), "string");
      }
      try {
        let editProduct = productModel.findByIdAndUpdate(pId, editData);
        editProduct.exec((err) => {
          if (err) console.log(err);
          return res.json({ success: "Product edit successfully" });
        });
      } catch (err) {
        console.log(err);
      }
    }
  }

  async getDeleteProduct(req, res) {
    let { pId } = req.body;
    if (!pId) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let deleteProductObj = await productModel.findById(pId);
        let deleteProduct = await productModel.findByIdAndDelete(pId);
        if (deleteProduct) {
          // Delete Image from uploads -> products folder
          Product.deleteImages(deleteProductObj.pImages, "string");
          return res.json({ success: "Product deleted successfully" });
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  async getSingleProduct(req, res) {
    let { pId } = req.body;
    if (!pId) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let singleProduct = await productModel
          .findById(pId)
          .populate("pCategory", "cName")
          .populate("pRatingsReviews.user", "name email userImage");
        if (singleProduct) {
          return res.json({ Product: singleProduct });
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  async getProductByCategory(req, res) {
    let { catId } = req.body;
    if (!catId) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let products = await productModel
          .find({ pCategory: catId })
          .populate("pCategory", "cName");
        if (products) {
          return res.json({ Products: products });
        }
      } catch (err) {
        return res.json({ error: "Search product wrong" });
      }
    }
  }

  async getProductByPrice(req, res) {
    let { price } = req.body;
    console.log(price);

    if (price == null) {
      return res.json({ error: "All fields must be required" });
    } else {
      try {
        let products = await productModel
          .find({ pPrice: { $gte: 0, $lte: price } })
          .populate("pCategory", "cName")
          .sort({ pPrice: 1 });
        if (products) {
          return res.json({ Products: products });
        }
      } catch (err) {
        return res.json({ error: "Filter product wrong" });
      }
    }
  }

  async getWishProduct(req, res) {
    let { productArray } = req.body;
    if (!productArray) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let wishProducts = await productModel.find({
          _id: { $in: productArray },
        });
        if (wishProducts) {
          return res.json({ Products: wishProducts });
        }
      } catch (err) {
        return res.json({ error: "Filter product wrong" });
      }
    }
  }

  async getCartProduct(req, res) {
    let { productArray } = req.body;
    if (!productArray) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let cartProducts = await productModel.find({
          _id: { $in: productArray },
        });
        if (cartProducts) {
          return res.json({ Products: cartProducts });
        }
      } catch (err) {
        return res.json({ error: "Cart product wrong" });
      }
    }
  }

  async getRevenue(req, res) {

    const { statisticBy } = req.body;

    console.log(statisticBy);
    
    if (!statisticBy) {
      return res.json({ error: "All fields must be required" });
    }

    try {
      let revenue;

      switch (statisticBy) {
        case "daily":
          revenue =  await orderModel.aggregate([
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" },
                  day: { $dayOfMonth: "$createdAt" },
                },
                totalRevenue: { $sum: "$amount" },
              },
            },
            {
              $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
            },
          ]);
          break;
        case "monthly":
          revenue = await orderModel.aggregate([
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" },
                },
                totalRevenue: { $sum: "$amount" },
              },
            },
            {
              $sort: { "_id.year": 1, "_id.month": 1 },
            },
          ]);
          break;
        case "yearly":
          revenue = await orderModel.aggregate([
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                },
                totalRevenue: { $sum: "$amount" },
              },
            },
            {
              $sort: { "_id.year": 1 },
            },
          ]);
          break;
        default:
          return res.status(400).json({ error: "Invalid statisticBy value" });
      }

      return res.json({ revenue });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "An error occurred" });
    }
  }

  async postAddReview(req, res) {
    let { pId, uId, rating, review } = req.body;
    if (!pId || !rating || !review || !uId) {
      return res.json({ error: "All filled must be required" });
    } else {
      let checkReviewRatingExists = await productModel.findOne({ _id: pId });
      if (checkReviewRatingExists.pRatingsReviews.length > 0) {
        checkReviewRatingExists.pRatingsReviews.map((item) => {
          if (item.user === uId) {
            return res.json({ error: "Your already reviewd the product" });
          } else {
            try {
              let newRatingReview = productModel.findByIdAndUpdate(pId, {
                $push: {
                  pRatingsReviews: {
                    review: review,
                    user: uId,
                    rating: rating,
                  },
                },
              });
              newRatingReview.exec((err, result) => {
                if (err) {
                  console.log(err);
                }
                return res.json({ success: "Thanks for your review" });
              });
            } catch (err) {
              return res.json({ error: "Cart product wrong" });
            }
          }
        });
      } else {
        try {
          let newRatingReview = productModel.findByIdAndUpdate(pId, {
            $push: {
              pRatingsReviews: { review: review, user: uId, rating: rating },
            },
          });
          newRatingReview.exec((err, result) => {
            if (err) {
              console.log(err);
            }
            return res.json({ success: "Thanks for your review" });
          });
        } catch (err) {
          return res.json({ error: "Cart product wrong" });
        }
      }
    }
  }

  async deleteReview(req, res) {
    let { rId, pId } = req.body;
    if (!rId) {
      return res.json({ message: "All filled must be required" });
    } else {
      try {
        let reviewDelete = productModel.findByIdAndUpdate(pId, {
          $pull: { pRatingsReviews: { _id: rId } },
        });
        reviewDelete.exec((err, result) => {
          if (err) {
            console.log(err);
          }
          return res.json({ success: "Your review is deleted" });
        });
      } catch (err) {
        console.log(err);
      }
    }
  }



  async getProductByImage(req, res) {
    try {
      // Access the uploaded file
      let image = req.file;

      if (!image) {
        return res.status(400).send({ error: 'No image uploaded' });
      }

      // Read the image file
      const imagePath = path.join(process.env.IMAGES_URL + "products", image.filename);
      const imageData = fs.readFileSync(imagePath);

      // Create a FormData instance and append the image file
      const formData = new FormData();
      formData.append('image', fs.createReadStream(imagePath));

      // Gọi API AI search
      const response = await axios.post('http://127.0.0.1:7000/find-similar-products', formData, {
        headers: {
          ...formData.getHeaders()
        }
      });

      // Xử lý kết quả trả về từ API
      const searchResults = response.data;

      let result = [];
      if (searchResults.similar_images.length > 0) {
        let listImages = [...new Set(searchResults.similar_images)];
        result = await productModel.find({ pImages: { $in: listImages } });
      }
      
      // Delete the uploaded image after processing
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Failed to delete image:', err);
        }
      });

      // Trả kết quả về cho frontend
      return res.json({ Products : result });
    } catch (error) {
      console.error('Error calling AI search API:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getProductBySearch(req, res) {
    let { search } = req.body;
    if (!search) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let products = await productModel.find({
          $or: [
            { pName: { $regex: search, $options: "i" } },
            { pDescription: { $regex: search, $options: "i" } },
          ],
        });
        if (products) {
          return res.json({ Products: products });
        }
      } catch (err) {
        return res.json({ error: "Search product wrong" });
      }
    }
  }
}

const productController = new Product();
module.exports = productController;
