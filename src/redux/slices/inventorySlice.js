import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchInventory = createAsyncThunk(
  'inventory/fetchInventory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('api/v1/inventory', { withCredentials: true });
      return response.data.metadata;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải dữ liệu kho');
    }
  }
);

export const fetchInventoryLots = createAsyncThunk(
  'inventory/fetchInventoryLots',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.get(`api/v1/inventory/product/${productId}/lots`, { withCredentials: true });
      return { productId, lots: response.data.metadata };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải danh sách lô');
    }
  }
);

export const createInventory = createAsyncThunk(
  'inventory/createInventory',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('api/v1/inventory', data, { withCredentials: true });
      return response.data.metadata;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể thêm sản phẩm vào kho');
    }
  }
);

export const deleteInventory = createAsyncThunk(
  'inventory/deleteInventory',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`api/v1/inventory/${id}`, { withCredentials: true });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể xoá');
    }
  }
);

export const processTransaction = createAsyncThunk(
  'inventory/processTransaction',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('api/v1/inventory/transaction', data, { withCredentials: true });
      return response.data.metadata;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Giao dịch thất bại');
    }
  }
);

export const fetchTransactions = createAsyncThunk(
  'inventory/fetchTransactions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params).toString();
      const response = await api.get(`api/v1/inventory/transactions?${query}`, { withCredentials: true });
      return response.data.metadata;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải lịch sử');
    }
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState: {
    items: [],
    transactions: [],
    lotsByProduct: {},
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      .addCase(fetchInventoryLots.fulfilled, (state, action) => {
        state.lotsByProduct[action.payload.productId] = action.payload.lots;
      })

      .addCase(createInventory.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })

      .addCase(deleteInventory.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      })

      .addCase(processTransaction.fulfilled, () => {
        // Inventory list and lots are refetched on the page after a transaction
        // because lot quantities and the list of lots can both change.
      })

      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload;
      });
  },
});

export default inventorySlice.reducer;
