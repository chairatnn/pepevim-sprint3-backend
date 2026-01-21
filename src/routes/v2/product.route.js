import { Router } from "express";
import { createProduct, deleteProduct, editProduct, getProductDetail, getProducts } from "../../modules/products/products.controller.js";

export const router = Router();

router.post("/", createProduct);
router.get("/",getProducts);
router.get("/:id",getProductDetail);
router.patch("/:id",editProduct);
router.delete("/:id",deleteProduct);