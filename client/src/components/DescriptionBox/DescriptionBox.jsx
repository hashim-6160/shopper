import React from "react";
import "./DescriptionBox.css";

const DescriptionBox = () => {
  return (
    <div className="descriptionbox">
      <div className="descriptionbox-navigator">
        <div className="descriptionbox-nav-box">Description</div>
        <div className="descriptionbox-nav-box fade">Reviews (122)</div>
      </div>
      <div className="descriptionbox-description">
        <p>
          An e-commerce Website is an online platform that facilitate buying and
          selling of products or services over the internet. It serves as a
          virtual marketplace where business and individuals showcase their
          products, interact with customers, and conduct transactions without
          the need for a physical presence. E-commerce websites have gained
          immense popularity due to their conveniant accessibility and the
          global reach they offer.
        </p>
        <p>
          E-commerce website typically display products or services available,
          detailed descriptions, images, prices and any available variants(eg.,
          sizes, colors). Each product usually has its own dedicate page with
          relevant information.
        </p>
      </div>
    </div>
  );
};

export default DescriptionBox;
