import dotenv from "dotenv";
import mongoose from "mongoose";
import Category from "../models/CategoryModel.js";
import Specification from "../models/SpecificationModel.js";
import Product from "../models/ProductModel.js";

dotenv.config();

async function verify() {
  await mongoose.connect(process.env.MONGO_URI);
  const categories = await Category.find({});
  console.log(`✅ Tổng số Danh mục B2B: ${categories.length}`);
  categories.forEach((c) => console.log(`   - ${c.name}`));

  const products = await Product.find({}).populate("specifications");
  console.log(`\n✅ Tổng số Sản phẩm B2B: ${products.length}`);

  const latitude = products.find((p) => p.name.includes("Latitude"));
  console.log(`\n🔍 Kiểm tra sản phẩm mẫu: ${latitude?.name}`);
  console.log(`   - Giá: ${latitude?.price.toLocaleString("vi-VN")} đ`);
  console.log(`   - Tồn kho: ${latitude?.countInStock}`);
  console.log(`   - Số thông số specs: ${latitude?.specifications?.length}`);
  latitude?.specifications?.forEach((s) => console.log(`     • [${s.key}]: ${s.value}`));

  await mongoose.disconnect();
  process.exit(0);
}

verify().catch((err) => {
  console.error(err);
  process.exit(1);
});
