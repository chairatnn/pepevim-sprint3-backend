import { Product } from "./products.model.js";
//import { Category } from "../models/category.model.js";

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    error.name = error.name || "DatabaseError";
    error.status = 500;
  }
};

export const getProductDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    error.name = error.name || "DatabaseError";
    error.status = 500;
  }
};

export const createProduct = async (req, res) => {
  try {
    const { productName, productDesc, price, category, sizes } = req.body;

    if (!productName || !productDesc || !price) {
      return res.status(400).json({
        message: "productName, productDesc, price, category are required",
      });
    }

    if (!sizes || !Array.isArray(sizes) || sizes.length === 0) {
      return res.status(400).json({
        message: "sizes is required",
      });
    }

    // 2. เช็ก category มีจริงไหม
    // const categoryExists = await Category.findById(category);
    // if (!categoryExists) {
    //   return res.status(404).json({
    //     message: "Category not found",
    //   });
    // }

    // 3. เตรียม sizes (ตั้ง status อัตโนมัติ)
    const preparedSizes = sizes.map((s) => ({
      size: s.size,
      price: s.price,
      stock: s.stock,
      status: s.stock === 0 ? "out_of_stock" : "active",
    }));

    // 4. create product
    const newProduct = await Product.create({
      productName,
      productDesc,
      price,
      category,
      sizes: preparedSizes,
    });

    return res.status(201).json({
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Create product failed",
    });
  }
};

export const editProduct = async (params) => {
  
}

export const deleteProduct = async (params) => {
  
}