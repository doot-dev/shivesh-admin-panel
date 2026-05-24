import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import userReducer from "../features/user/userSlice";
import productReducer from "../features/product/productSlice";
import clientReducer from "../features/clients/clientsSlice";
import projectReducer from "../features/projects/projectSlice";
import projectProductReducer from "../features/projects/projectProductSlice";
import projectProductVendorReducer from "../features/projects/projectProductVendorSlice";
import vendorReducer from "../features/vendors/vendorSlice";
import orderReducer from "../features/orders/orderSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    products: productReducer,
    client: clientReducer,
    vendor: vendorReducer,
    project: projectReducer,
    projectProduct: projectProductReducer,
    projectProductVendor: projectProductVendorReducer,
    orders: orderReducer,
  },
});

export default store;
