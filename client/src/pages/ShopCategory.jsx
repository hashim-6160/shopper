import React, { useContext, useEffect, useState } from "react";
import "./css/ShopCategory.css";
import { ShopContext } from "../context/ShopContext";
import Item from "../components/Item/Item";

const ShopCategory = (props) => {
  const { all_product } = useContext(ShopContext);
  const [sortOption, setSortOption] = useState("default");
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Filter products based on targetGroup and update filteredProducts
  useEffect(() => {
    const filtered = all_product.filter(item => item.targetGroup === props.targetGroup);
    setFilteredProducts(filtered);
  }, [all_product, props.targetGroup]);

  // Handle sorting and update the filtered products
  const handleSortChange = (event) => {
    const selectedOption = event.target.value;
    setSortOption(selectedOption);

    // Sorting logic
    let sortedProducts = [...filteredProducts];
    if (selectedOption === "priceAsc") {
      sortedProducts.sort((a, b) => a.new_price - b.new_price);
    } else if (selectedOption === "priceDesc") {
      sortedProducts.sort((a, b) => b.new_price - a.new_price);
    } else if (selectedOption === "newArrivals") {
      sortedProducts.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (selectedOption === "aA") {
      sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
    } else if (selectedOption === "zZ") {
      sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
    }

    setFilteredProducts(sortedProducts);
  };

  return (
    <div className="shop-category">
      <img className="shopcategory-banner" src={props.banner} alt="" />
      <div className="shopcategory-indexSort">
        <p>
          <span>Showing {filteredProducts.length} </span> products
        </p>
        <div className="shopcategory-sort-container">
          <select value={sortOption} onChange={handleSortChange} className="shopcategory-sort">
            <option value="default">Sort By</option>
            <option value="newArrivals">New Arrivals</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="aA">aA - zZ</option>
            <option value="zZ">zZ - aA</option>
          </select>
        </div>
      </div>
      <div className="shopcategory-products">
        {filteredProducts.map((item) => (
          <Item
            key={item.id}
            id={item.id}
            name={item.name}
            image={item.images[0]}
            new_price={item.new_price}
            old_price={item.old_price}
          />
        ))}
      </div>
      <div className="shopcategory-loadmore">Explore More</div>
    </div>
  );
};

export default ShopCategory;
