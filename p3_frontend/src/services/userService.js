import axiosClient from '../api/axiosClient';

const userService = {
  // AUTH
  login: (credentials) => axiosClient.post('/customers/login', credentials),
  register: (userData) => axiosClient.post('/customers/register', userData),
  getCustomerById: (id) => axiosClient.get(`/customers/${id}`),
  updateCustomer: (id, data) => axiosClient.put(`/customers/${id}`, data),

  // PHOTOS (Kho ảnh cá nhân - giống upload file nhanh trên colorbook)
  getMyPhotos: () => axiosClient.get('/photos/my-photos'),
  uploadPhoto: (formData) => axiosClient.post('/photos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),  // axios tự set multipart/form-data
  deletePhoto: (photoId) => axiosClient.delete(`/photos/${photoId}`),

  // TEMPLATES & SIZES (Xem mẫu + giá - giống bảng giá rửa ảnh/Polaroid)
  getAvailableTemplates: () => axiosClient.get('/producttemplates/active'),  // Chỉ mẫu đang bán
  getSizesByTemplate: (templateId) => axiosClient.get(`/printsizes/ByTemplate/${templateId}`),
  getMyOrders: (custId) => axiosClient.get(`/orders/customer/${custId}/details`),
  getTemplateById: (templateId) => axiosClient.get(`/producttemplates/${templateId}`),
  createDraftOrder: (orderData) => axiosClient.post('/orders', orderData),
  createPhoto: (photoData) => axiosClient.post('/photos', photoData),
  createOrderDetail: (detailData) => axiosClient.post('/orderdetails', detailData),
  updateOrder: (orderId, orderData) => axiosClient.put(`/orders/${orderId}`, orderData),

  // ORDERS (Đặt hàng & lịch sử - flow: chọn mẫu → upload/chọn ảnh → chọn size → giỏ → đặt)
  createOrder: (orderData) => axiosClient.post('/orders', orderData),  // { shippingAddress, items: [{photoId, sizeId, quantity, note?}] }
  getMyOrders: (custId) => axiosClient.get(`/orders/customer/${custId}/details`),
  cancelOrder: (orderId) =>
    axiosClient.put(`/orders/Status/${orderId}`, JSON.stringify('Cancelled'), {
      headers: { 'Content-Type': 'application/json' }
    }),

  // PAYMENTS (Thanh toán - có thể tích hợp sau với cổng thanh toán như VNPay, MoMo)
  createPayment: (paymentData) => axiosClient.post('/payments', paymentData),
};

export default userService;