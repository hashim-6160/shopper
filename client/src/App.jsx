import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Shop from "./pages/Shop";
import ShopCategory from "./pages/ShopCategory";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import LoginSignup from "./pages/LoginSignup";
import Footer from "./components/Footer/Footer";
import men_banner from "./components/Assets/Frontend_Assets/banner_mens.png";
import women_banner from "./components/Assets/Frontend_Assets/banner_women.png";
import kid_banner from "./components/Assets/Frontend_Assets/banner_kids.png";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Checkout from "./pages/Checkout";
import UserProfile from "./pages/UserProfile";

function App() {
  const GoogleAuthWrapper = ()=>{
    return(
      <GoogleOAuthProvider clientId="733447674392-a9eitssmu87gbg1ps4ikk0b99l3c5rfl.apps.googleusercontent.com">
        <LoginSignup></LoginSignup>
      </GoogleOAuthProvider>
    )
  }
  return (
    <div>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Shop />} />
          <Route
            path="/mens"
            element={<ShopCategory banner={men_banner} targetGroup="Men" />}
          />
          <Route
            path="/womens"
            element={<ShopCategory banner={women_banner} targetGroup="Women" />}
          />
          <Route
            path="/kids"
            element={<ShopCategory banner={kid_banner} targetGroup="Kids" />}
          />
          <Route path="/product" element={<Product />}>
            <Route path=":productId" element={<Product />} />
          </Route>
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<GoogleAuthWrapper/>} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/userprofile/*" element={<UserProfile />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
