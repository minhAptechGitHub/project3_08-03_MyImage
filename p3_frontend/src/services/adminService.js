import axiosClient from '../api/axiosClient';

const adminService = {
  login: (credentials) => axiosClient.post('/Admins/login', credentials),

  getTemplates: () => axiosClient.get('/producttemplates'),
  getTemplateById: (id) => axiosClient.get(`/producttemplates/${id}`),
  createTemplate: (data) => axiosClient.post('/producttemplates', data),
  updateTemplate: (id, data) => axiosClient.put(`/producttemplates/${id}`, data),
  deleteTemplate: (id) => axiosClient.delete(`/producttemplates/${id}`),

  getPrintSizes: () => axiosClient.get('/printsizes'),
  getPrintSizesByTemplate: (templateId) => axiosClient.get(`/printsizes/ByTemplate/${templateId}`),
  createPrintSize: (data) => axiosClient.post('/printsizes', data),
  updatePrintSize: (id, data) => axiosClient.put(`/printsizes/${id}`, data),
  deletePrintSize: (id) => axiosClient.delete(`/printsizes/${id}`),

  getProductGalleries: () => axiosClient.get('/productgallery'),
  getGalleryByTemplate: (templateId) => axiosClient.get(`/productgallery/ByTemplate/${templateId}`),
  createGallery: (data) => axiosClient.post('/productgallery', data),
  deleteGallery: (id) => axiosClient.delete(`/productgallery/${id}`),

  getAllOrders: () => axiosClient.get('/orders'),
  getOrderById: (orderId) => axiosClient.get(`/orders/${orderId}`),
  createOrder: (data) => axiosClient.post('/orders', data),
  updateOrder: (id, data) => axiosClient.put(`/orders/${id}`, data),
  updateOrderStatus: (orderId, status) =>
    axiosClient.put(`/orders/Status/${orderId}`, JSON.stringify(status), {
      headers: { 'Content-Type': 'application/json' },
    }),
  deleteOrder: (id) => axiosClient.delete(`/orders/${id}`),

  getAllOrderDetails: () => axiosClient.get('/orderdetails'),
  getOrderDetailById: (id) => axiosClient.get(`/orderdetails/${id}`),
  createOrderDetail: (data) => axiosClient.post('/orderdetails', data),
  updateOrderDetail: (id, data) => axiosClient.put(`/orderdetails/${id}`, data),
  deleteOrderDetail: (id) => axiosClient.delete(`/orderdetails/${id}`),

  getPayments: () => axiosClient.get('/payments'),
  getPaymentById: (id) => axiosClient.get(`/payments/${id}`),
  createPayment: (data) => axiosClient.post('/payments', data),
  updatePayment: (id, data) => axiosClient.put(`/payments/${id}`, data),
  deletePayment: (id) => axiosClient.delete(`/payments/${id}`),

  getAllCustomers: () => axiosClient.get('/customers'),
  getCustomerById: (id) => axiosClient.get(`/customers/${id}`),
  updateCustomer: (id, data) => axiosClient.put(`/customers/${id}`, data),
  deleteCustomer: (id) => axiosClient.delete(`/customers/${id}`),

  getAllAdmins: () => axiosClient.get('/admins'),
  createAdmin: (data) => axiosClient.post('/admins', data),
  updateAdmin: (id, data) => axiosClient.put(`/admins/${id}`, data),
  deleteAdmin: (id) => axiosClient.delete(`/admins/${id}`),

  getPhotos: () => axiosClient.get('/photos'),
  getPhotoById: (id) => axiosClient.get(`/photos/${id}`),
  deletePhoto: (id) => axiosClient.delete(`/photos/${id}`),

  uploadTemplateImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post('/producttemplates/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  uploadGalleryImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post('/productgallery/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default adminService;