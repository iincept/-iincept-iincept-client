import axiosClient from './axiosClient';

export const getCart = async () => {
  const response = await axiosClient.get('/cart');
  return response.data;
};

export const addToCart = async (productId, quantity = 1, itemData = {}) => {
  const response = await axiosClient.post('/cart', { productId, quantity, ...itemData });
  return response.data;
};

export const updateCartQuantity = async (productId, quantity) => {
  const response = await axiosClient.put('/cart', { id: productId, quantity });
  return response.data;
};

export const removeFromCart = async (productId) => {
  const response = await axiosClient.delete('/cart', { data: { id: productId } });
  return response.data;
};

export const clearCart = async () => {
  const response = await axiosClient.delete('/cart');
  return response.data;
};

export const mergeCart = async (items) => {
  const response = await axiosClient.post('/cart/merge', { items });
  return response.data;
};
