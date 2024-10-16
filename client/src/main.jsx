import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import ShopContextProvider from "./context/ShopContext.jsx";
import store from "./redux/store.jsx";
import {Provider} from "react-redux"

createRoot(document.getElementById("root")).render(
  <Provider store={store}> {/* Provide the Redux store */}
    <ShopContextProvider>
      <App />
    </ShopContextProvider>
  </Provider>
);

