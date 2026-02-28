import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import productService from "../../services/productService";
import { toast } from "react-toastify";

export const fetchProducts = createAsyncThunk("products/fetchProducts", async () => {
    const response = await productService.getAllProducts();
    return response;
})

export const createProduct = createAsyncThunk("products/create", async (productres, { rejectWithValue }) => {
    try {
        const res = await productService.createProduct(productres);
        toast.success(res?.message);
        return res;
    } catch (err) {
        const message = err?.res?.message;
        toast.error(message)
        return rejectWithValue(err.response?.res || err.message)
    }
})

export const fetchProductsById = createAsyncThunk("products/fetchProdById", async (productId, { rejectWithValue }) => {
    try {
        const res = await productService.getProductById(productId);
        // toast.success(res?.message);
        console.log("dfsdfs", res);
        return res.data;
    } catch (err) {
        const message = err?.res?.message;
        toast.error(message)
        return rejectWithValue(err.response?.res || err.message)
    }
})

export const updateProduct = createAsyncThunk("products/editproduct", async (productres, { rejectWithValue }) => {
    try {
        const res = await productService.updateProduct(productres);
        toast.success(res?.message);
        return res.data;
    } catch (err) {
        const message = err?.res?.message;
        toast.error(message)
        return rejectWithValue(err.response?.res || err.message)
    }
})

export const removeProduct = createAsyncThunk("products/deleteProd", async (productId, { rejectWithValue }) => {
    try {
        const res = await productService.deleteProduct(productId);
        toast.success(res?.message)
        return res;
    } catch (err) {
        const message = err?.res?.message;
        toast.error(message)
        return rejectWithValue(err.response?.res || err.message);
    }
})

export const createGradeSize = createAsyncThunk("products/creategradeSize", async (gradeData, { rejectWithValue }) => {
    try {
        const res = await productService.createGradeSize(gradeData);
        toast.success(res?.message)
        return res;
    } catch (err) {
        const message = err?.res?.message;
        toast.error(message)
        return rejectWithValue(err.response?.res || err.message);
    }
})

// export const updateGradeSize = createAsyncThunk("products/updategradeSize", async (gradeData, { rejectWithValue }) => {
//     try {
//         const res = await productService.updateGradeSize(gradeData);
//         toast.success(res?.message)
//         return res;
//     } catch (err) {
//         const message = err?.res?.message;
//         toast.error(message)
//         return rejectWithValue(err.response?.res || err.message);
//     }
// })

export const updateGradeSize = createAsyncThunk(
    "products/updategradeSize",
    async (gradeData, { rejectWithValue }) => {
        try {
            debugger;
            const res = await productService.updateGradeSize(gradeData);
            // assuming res = { message, data } from API
            toast.success(res?.message);
            return res;
        } catch (err) {
            const message = err?.res?.message;
            toast.error(message);
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);



// export const deleteGradeSize = createAsyncThunk("products/deletegradesize", async (gradeId, {
//     rejectWithValue
// }) => {
//     try {
//         const res = await productService.deleteGradeSize(gradeId);
//         toast.success(res?.message)
//         return res;
//     } catch (err) {
//         const message = err?.res?.message;
//         toast.error(message)
//         return rejectWithValue(err.response?.res || err.message);
//     }
// })

export const deleteGradeSize = createAsyncThunk(
    "products/deletegradesize",
    async ( gradeId , { rejectWithValue }) => {
        try {
            console.log("gradeId", gradeId);
            const res = await productService.deleteGradeSize(gradeId);
            toast.success(res?.message);
            return res;
        } catch (err) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

//slice
const productSlice = createSlice({
    name: "products",
    initialState: {
        productList: [],
        currentProduct: [], // Single product for detail view
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                // Safely handle various API response structures
                const data = action.payload?.data || action.payload?.products || action.payload || [];
                state.productList = Array.isArray(data) ? data : [];
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.productList.push(action.payload);
            })
            .addCase(fetchProductsById.fulfilled, (state, action) => {
                // Store single product in separate state
                state.currentProduct = action.payload;
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                const index = state.productList.findIndex(u => u.id === action.payload.id);

                if (index !== -1) state.productList[index] = action.payload;
            })
            .addCase(removeProduct.fulfilled, (state, action) => {
                state.productList = state.productList.filter(u => u.id !== action.meta.arg);
            })
            .addCase(createGradeSize.fulfilled, (state, action) => {
                state.productList.push(action.payload);
                console.log("productList", state.productList)
                // const { productId, gradeSize } = action.payload;
                // console.log("Product id and grade size", productId, gradeSize)
                // const product = state.productList.find(p => p.id === productId);
                // console.log("Product ......", product)
                // debugger;
                // if (product) {
                //     if (!product.gradeSizes) product.gradeSizes = [];
                //     product.gradeSizes.push(gradeSize);
                // }
            })
            // .addCase(updateGradeSize.fulfilled, (state, action) => {
            //     const { productId, gradeSize } = action.payload;
            //     const product = state.productList.find(p => p.id === productId);
            //     if (product && product.gradeSizes) {
            //         const index = product.gradeSizes.findIndex(g => g.id === gradeSize.id);
            //         if (index !== -1) product.gradeSizes[index] = gradeSize;
            //     }
            // })
            .addCase(updateGradeSize.fulfilled, (state, action) => {
                // do nothing, message already shown via toast in thunk
            })

            // .addCase(deleteGradeSize.fulfilled, (state, action) => {
            //     const { productId, gradeId } = action.payload;
            //     const product = state.productList.find(p => p.id === productId);
            //     if (product && product.gradeSizes) {
            //         product.gradeSizes = product.gradeSizes.filter(g => g.id !== gradeId);
            //     }
            // })
            .addCase(deleteGradeSize.fulfilled, (state, action) => {
               
            });

    }
})
export default productSlice.reducer;