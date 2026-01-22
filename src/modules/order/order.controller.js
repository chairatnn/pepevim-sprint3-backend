import { Order } from "./order.model.js";
import { Product } from "../products/products.model.js";

export const createOrder = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { items, paymentMethod, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item._id);
      if (!product) {
        return res.status(404).json({
          message: `Product not found: ${item.productName}`,
        });
      }

      const sizeData = product.sizes.find((s) => s.size === item.size);

      //   if (!sizeData) {
      //     return res.status(400).json({
      //       message: `Size ${item.size} not found for ${product.productName}`,
      //     });
      //   }

      const price = sizeData.price ?? product.price;

      orderItems.push({
        productId: product._id,
        productName: product.productName,
        size: item.size,
        price,
        quantity: item.quantity,
      });

      totalAmount += price * item.quantity;
    }

    const order = await Order.create({
      items: orderItems,
      totalAmount,
      paymentMethod,
      shippingAddress,
      status: "completed",
    });

    if (userId) {
      orderData.user = userId;
    }
    return res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getOrder = async (req, res) => {
  try {
    const order = await Order.find();
    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    error.name = error.name || "DatabaseError";
    error.status = 500;
  }
};