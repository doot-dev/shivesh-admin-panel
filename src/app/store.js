import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import userReducer from "../features/user/userSlice";
import productReducer from "../features/product/productSlice";
import clientReducer from "../features/clients/clientsSlice";
import projectReducer from "../features/projects/projectSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    products: productReducer,
    client: clientReducer,
    project: projectReducer,
  },
});

export default store;
