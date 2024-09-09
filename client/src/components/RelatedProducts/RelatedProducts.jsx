import React, { useEffect, useState } from "react";
import "./RelatedProducts.css";
import Item from "../Item/Item";
import { useParams } from "react-router-dom";

const RelatedProducts = () => {
  const { productId } = useParams(); // Get the current productId from the URL
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        const res = await fetch(`http://localhost:4000/relatedproducts/${productId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setRelatedProducts(data);
      } catch (error) {
        console.error("Error fetching related products:", error);
        setError(error.message);
      }
    };

    fetchRelatedProducts();
  }, [productId]);

  return (
    <div className="relatedproducts">
      <h1>Related Products</h1>
      <hr />
      <div className="relatedproducts-item">
        {error && <p>{error}</p>}
        {relatedProducts.map((item, i) => (
          <Item
            key={i}
            id={item.id}
            name={item.name}
            image={item.images}
            new_price={item.new_price}
            old_price={item.old_price}
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
