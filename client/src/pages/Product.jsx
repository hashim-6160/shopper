import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { useParams } from "react-router-dom";
import Breadcrum from "../components/Breadcrum/Breadcrum";
import ProductDisplay from "../components/ProductDisplay/ProductDisplay";
import DescriptionBox from "../components/DescriptionBox/DescriptionBox";
import RelatedProducts from "../components/RelatedProducts/RelatedProducts";

const Product = () => {
  const { all_product} = useContext(ShopContext);
  const { productId } = useParams();
  console.log("Product ID (from URL): ", productId, " as Number: ", Number(productId));
  console.log("All Products: ", all_product);

  const product = all_product.find((e) => e.id === productId);
  console.log("Product: ", product);
  if (!product) {
    return <div>Product not found or still loading...</div>; // Handle no product case
  }
  return (
    <div>
      <Breadcrum product={product} />
      <ProductDisplay product={product} />
      <DescriptionBox  />
      <RelatedProducts />
    </div>
  );
};

export default Product;
