export const tableConfig = [

    // ── Customers ────────────────────────────────────────────────────────────
    {
        key: 'customers',
        label: 'Customer',
        columns: [
            { key: 'custId',     label: 'ID',              required: true,  isPrimaryKey: true, readOnly: true },
            { key: 'fName',      label: 'First Name',      required: true,  maxLength: 50 },
            { key: 'lName',      label: 'Last Name',       required: true,  maxLength: 50 },
            { key: 'dob',        label: 'Date of Birth',   required: false, inputType: 'date' },
            { key: 'gender',     label: 'Gender',          required: false, inputType: 'select', 
                options: [
                    { value: 'M', label: 'Male' }, 
                    { value: 'F', label: 'Female' }
                ] 
            },
            { key: 'pNo',        label: 'Phone Number',    required: false, maxLength: 20 },
            { key: 'address',    label: 'Address',         required: false, maxLength: 255, multiline: true },
            { key: 'email',      label: 'Email',           required: true,  maxLength: 100 },
            { key: 'username',   label: 'Username',        required: true,  maxLength: 50 },
            { key: 'password',   label: 'Password',        required: true,  maxLength: 255, inputType: 'password', hideInTable: true },
            { key: 'isActive',   label: 'Active',          required: false, inputType: 'select', isBoolean: true,
                 options: [
                    { value: true, label: 'Yes' },
                    { value: false, label: 'No' }

                 ]
                },
            { key: 'createdAt',  label: 'Created At',      required: false, readOnly: true, isDate: true },
        ],
    },

    // ── Admins ───────────────────────────────────────────────────────────────
    {
        key: 'admins',
        label: 'Admin',
        columns: [
            { key: 'adminId',   label: 'ID',          required: true,  isPrimaryKey: true, readOnly: true },
            { key: 'username',  label: 'Username',    required: true,  maxLength: 50 },
            { key: 'password',  label: 'Password',    required: true,  maxLength: 255, inputType: 'password', 
                hideInTable: true 
            },
            { key: 'createdAt', label: 'Created At',  required: false, readOnly: true, isDate: true },
        ],
    },

    // ── PrintSizes ───────────────────────────────────────────────────────────
    {
        key: 'printSizes',
        label: 'Print Size',
        columns: [
            { key: 'sizeId',      label: 'ID',          required: true,  isPrimaryKey: true, readOnly: true },
            { key: 'sizeName',    label: 'Size Name',   required: true,  maxLength: 20 },
            { key: 'price',       label: 'Price ($)',   required: true,  inputType: 'number', min: 0, step: 0.01 },
            { key: 'isAvailable', label: 'Available',   required: false, inputType: 'select', isBoolean: true, 
                options: [
                    { value: true, label: 'Yes' },
                    { value: false, label: 'No' }
                ] 
            },
            { key: 'createdAt',   label: 'Created At',  required: false, readOnly: true, isDate: true },
        ],
    },

    // ── Orders ───────────────────────────────────────────────────────────────
    {
        key: 'orders',
        label: 'Order',
        columns: [
            { key: 'orderId',            label: 'Order ID',                required: true,  isPrimaryKey: true, readOnly: true, 
                inputType: 'number', min: 1, max: 1000 
            },
            { key: 'custId',             label: 'Customer ID',             required: true,  inputType: 'number', min: 1 },
            { key: 'folderName',         label: 'Folder Name',             required: false, readOnly: true },
            { key: 'orderDate',          label: 'Order Date',              required: false, readOnly: true, isDate: true },
            { key: 'totalPrice',         label: 'Total Price ($)',         required: false, readOnly: true, inputType: 'number',
                 min: 0, step: 0.01 
            },
            { key: 'shippingAddress',    label: 'Shipping Address',        required: true,  maxLength: 500, multiline: true },
            { key: 'status',             label: 'Status',                  required: true,  inputType: 'select',
                options: [
                    { value: 'Pending', label: 'Pending' }, 
                    { value: 'Payment Verified', label: 'Payment Verified' }, 
                    { value: 'Processing', label: 'Processing' }, 
                    { value: 'Printed', label: 'Printed' }, 
                    { value: 'Shipped', label: 'Shipped' }, 
                    { value: 'Completed', label: 'Completed' }, 
                    { value: 'Cancelled', label: 'Cancelled' }
                ] 
            },
            { key: 'processedByAdminId', label: 'Processed By (Admin ID)', required: false, inputType: 'number', min: 1 },
        ],
    },

    // ── Photos ───────────────────────────────────────────────────────────────
    {
        key: 'photos',
        label: 'Photo',
        columns: [
            { key: 'photoId',    label: 'Photo ID',    required: true,  isPrimaryKey: true, readOnly: true },
            { key: 'custId',     label: 'Customer ID', required: true,  inputType: 'number', min: 1 },
            { key: 'fileName',   label: 'File Name',   required: true,  maxLength: 255 },
            { key: 'filePath',   label: 'File Path',   required: true,  maxLength: 500 },
            { key: 'uploadDate', label: 'Upload Date', required: false, readOnly: true, isDate: true },
        ],
    },

    // ── OrderDetails ─────────────────────────────────────────────────────────
    {
        key: 'orderDetails',
        label: 'Order Detail',
        columns: [
            { key: 'orderDetailId', label: 'Detail ID',           required: true,  isPrimaryKey: true, readOnly: true },
            { key: 'orderId',       label: 'Order ID',            required: true,  inputType: 'number', min: 1 },
            { key: 'photoId',       label: 'Photo ID',            required: true,  inputType: 'number', min: 1 },
            { key: 'sizeId',        label: 'Size ID',             required: true,  inputType: 'number', min: 1 },
            { key: 'quantity',      label: 'Quantity',            required: true,  inputType: 'number', min: 1, step: 1 },
            { key: 'pricePerCopy',  label: 'Price Per Copy ($)',  required: true,  inputType: 'number', min: 0, step: 0.01 },
            { key: 'lineTotal',     label: 'Line Total ($)',      required: false, readOnly: true, inputType: 'number' },
        ],
    },

    // ── Payments ─────────────────────────────────────────────────────────────
    {
        key: 'payments',
        label: 'Payment',
        columns: [
            { key: 'paymentId',           label: 'Payment ID',              required: true,  isPrimaryKey: true, readOnly: true },
            { key: 'orderId',             label: 'Order ID',                required: true,  inputType: 'number', min: 1 },
            { key: 'paymentMethod',       label: 'Payment Method',          required: true,  inputType: 'select', 
                options: [
                    { value: 'CreditCard', label: 'Credit Card' },
                    { value: 'DirectPayment', label: 'Direct Payment' }
                ] 
            },
            { key: 'creditCardEncrypted', label: 'Credit Card (Encrypted)', required: false, maxLength: 500, inputType: 'password', 
                hideInTable: true, showWhen: { key: 'paymentMethod', value: 'CreditCard' } 
            },
            { key: 'encryptionMethod',    label: 'Encryption Method',       required: false, maxLength: 50,  
                showWhen: { key: 'paymentMethod', value: 'CreditCard' } 
            },
            { key: 'paymentDate',         label: 'Payment Date',            required: false, readOnly: true, isDate: true },
            { key: 'paymentStatus',       label: 'Payment Status',          required: true,  inputType: 'select',
                options: [
                    { value: 'Pending', label: 'Pending' }, 
                    { value: 'Verified', label: 'Verified' }, 
                    { value: 'Failed', label: 'Failed' }, 
                    { value: 'Refunded', label: 'Refunded' }
                ] 
            },
        ],
    },

];