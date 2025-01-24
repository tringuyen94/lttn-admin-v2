// src/redux/store.js

import { configureStore } from "@reduxjs/toolkit";
import productReducer from "./slices/productSlice";
import brandsReducer from "./slices/brandSlice";
import categoryReducer from "./slices/categorySlice";
import projectReducer from "./slices/projectSlice";
const store = configureStore({
  reducer: {
    products: productReducer,
    brands: brandsReducer,
    categories: categoryReducer,
    projects: projectReducer,
  },
});

export default store;
