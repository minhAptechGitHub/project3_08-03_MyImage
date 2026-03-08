const Api_Url = 'http://localhost:5002';

const apiService = {
    async get(endpoint) {
        try {
            const response = await fetch(`${Api_Url}/api/${endpoint}`);
            if (!response.ok) throw new Error('Failed to fetch data');
            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            throw error;
        }
    },
    async create(endpoint, data) {
        try {
            const response = await fetch(`${Api_Url}/api/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to create item');
            return await response.json();
        } catch (error) {
            console.error(`Error creating ${endpoint}:`, error);
            throw error;
        }
    },

    async update(endpoint, id, data) {
        try {
            const response = await fetch(`${Api_Url}/api/${endpoint}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to update item');
            return response.status === 204 ? {} : await response.json();
        } catch (error) {
            console.error(`Error updating ${endpoint}/${id}:`, error);
            throw error;
        }
    },

    async delete(endpoint, id) {
        try {
            const response = await fetch(`${Api_Url}/api/${endpoint}/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete item');
            return true;
        } catch (error) {
            console.error(`Error deleting ${endpoint}/${id}:`, error);
            throw error;
        }
    },

    async login(endpoint, data) {
    try {
        const response = await fetch(`${Api_Url}/api/${endpoint}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        
        if (!response.ok) return null;
        
        return await response.json();
    } catch (error) {
        console.error(`Error logging in ${endpoint}:`, error);
        return null; 
    }
},

    // Customers endpoints
    customers: {
        getAll: () => apiService.get('Customers'),
        create: (data) => apiService.create('Customers', data),
        update: (id, data) => apiService.update('Customers', id, data),
        delete: (id) => apiService.delete('Customers', id),
        login:  (data) => apiService.login('Customers', data),
    },
    // Admins endpoints
    admins: {
        getAll: () => apiService.get('Admins'),
        create: (data) => apiService.create('Admins', data),
        update: (id, data) => apiService.update('Admins', id, data),
        delete: (id) => apiService.delete('Admins', id),
        login:  (data) => apiService.login('Admins', data),
    },
    // PrintSizes endpoints
    printSizes: {
        getAll: () => apiService.get('PrintSizes'),
        create: (data) => apiService.create('PrintSizes', data),
        update: (id, data) => apiService.update('PrintSizes', id, data),
        delete: (id) => apiService.delete('PrintSizes', id),
    },
    // Photos endpoints
    photos: {
        getAll: () => apiService.get('Photos'),
        create: (data) => apiService.create('Photos', data),
        update: (id, data) => apiService.update('Photos', id, data),
        delete: (id) => apiService.delete('Photos', id),
    },
    // Orders endpoints
    orders: {
        getAll: () => apiService.get('Orders'),
        create: (data) => apiService.create('Orders', data),
        update: (id, data) => apiService.update('Orders', id, data),
        delete: (id) => apiService.delete('Orders', id),
    },
    // OrderDetails endpoints
    orderDetails: {
        getAll: () => apiService.get('OrderDetails'),
        create: (data) => apiService.create('OrderDetails', data),
        update: (id, data) => apiService.update('OrderDetails', id, data),
        delete: (id) => apiService.delete('OrderDetails', id),
    },
    // Payments endpoints
    payments: {
        getAll: () => apiService.get('Payments'),
        create: (data) => apiService.create('Payments', data),
        update: (id, data) => apiService.update('Payments', id, data),
        delete: (id) => apiService.delete('Payments', id),
    },
}

export default apiService;