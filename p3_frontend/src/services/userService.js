import axiosClient from '../api/axiosClient';

const userService = {
  // AUTH
  login: (credentials) => axiosClient.post('/customers/login', credentials),
  register: (userData) => axiosClient.post('/customers/register', userData),
  getCustomerById: (id) => axiosClient.get(`/customers/${id}`),
  updateCustomer: (id, data) => axiosClient.put(`/customers/${id}`, data),

  // PHOTOS
  getMyPhotos: () => axiosClient.get('/photos/my-photos'),
  uploadPhoto: (formData) => axiosClient.post('/photos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deletePhoto: (photoId) => axiosClient.delete(`/photos/${photoId}`),
  createPhoto: (photoData) => axiosClient.post('/photos', photoData),

  // TEMPLATES & SIZES
  getAvailableTemplates: () => axiosClient.get('/producttemplates/active'),
  getSizesByTemplate: (templateId) => axiosClient.get(`/printsizes/ByTemplate/${templateId}`),
  getTemplateById: (templateId) => axiosClient.get(`/producttemplates/${templateId}`),

  // ORDERS
  createDraftOrder: (orderData) => axiosClient.post('/orders', orderData),
  createOrder: (orderData) => axiosClient.post('/orders', orderData),
  createOrderDetail: (detailData) => axiosClient.post('/orderdetails', detailData),
  updateOrder: (orderId, orderData) => axiosClient.put(`/orders/${orderId}`, orderData),
  getMyOrders: (custId) => axiosClient.get(`/orders/customer/${custId}/details`),
  cancelOrder: (orderId) =>
    axiosClient.put(`/orders/Status/${orderId}`, JSON.stringify('Cancelled'), {
      headers: { 'Content-Type': 'application/json' }
    }),

  // PAYMENTS
  createPayment: (paymentData) => axiosClient.post('/payments', paymentData),

  // VNPAY
  createVnPayUrl: (orderId, amount) =>
    axiosClient.post('/vnpay/create-payment-url', { orderId, amount }),
  confirmVnPayCallback: (queryString) =>
    axiosClient.get(`/vnpay/callback?${queryString}`),
};

export default userService;