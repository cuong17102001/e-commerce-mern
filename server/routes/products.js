const express = require("express");
const router = express.Router();
const productController = require("../controller/products");
const multer = require("multer");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.env.IMAGES_URL + "products");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.get("/all-product", productController.getAllProduct);
router.post("/product-by-category", productController.getProductByCategory);
router.post("/product-by-image",upload.single('image'), productController.getProductByImage);
router.post("/product-by-price", productController.getProductByPrice);
router.post("/product-by-search", productController.getProductBySearch);
router.post("/wish-product", productController.getWishProduct);
router.post("/cart-product", productController.getCartProduct);

router.post("/add-product", upload.any(), productController.postAddProduct);
router.post("/edit-product", upload.any(), productController.postEditProduct);
router.post("/delete-product", productController.getDeleteProduct);
router.post("/single-product", productController.getSingleProduct);

router.post("/add-review", productController.postAddReview);
router.post("/delete-review", productController.deleteReview);

module.exports = router;
