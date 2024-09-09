import React from "react";
import "./Breadcrum.css";
import arrow_icon from "../Assets/Frontend_Assets/breadcrum_arrow.png";

const Breadcrum = (props) => {
  const { product } = props;
  console.log( "from breadcrum:",product )

  // Return early if product or its properties are undefined
  if (!product || !product.targetGroup || !product.name) {
    return null; // Or return some fallback UI
  }

  return (
    <div className="breadcrum">
      Home <img src={arrow_icon} alt="" /> Shop <img src={arrow_icon} alt="" />
      {product.targetGroup} <img src={arrow_icon} alt="" /> {product.name}
    </div>
  );
};

export default Breadcrum;
