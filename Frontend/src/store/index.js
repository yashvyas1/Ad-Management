import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";
import { apiSlice } from "./api/apiSlice";
import { modalSlice } from "@/app/slices/modalSlice";

const store = configureStore({
  reducer: {
    ...rootReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
    [modalSlice.name]: modalSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => {
    const middleware = [...getDefaultMiddleware({
      serializableCheck: false,
    }), apiSlice.middleware];
    return middleware;
  },
});

export default store;
