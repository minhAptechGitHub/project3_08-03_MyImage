import React, { useState, useEffect } from 'react';
import apiService from './Services';
import './AdminPage.css';
import { tableConfig } from './Tableconfig';
import { formatValue } from './Utils';
import CreateEditModal from './Modal';

function AdminPage({user, onLogout}) {
    const [activeTab, setActiveTab] = useState('customers');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = data.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(data.length / rowsPerPage);


    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [editData, setEditData] = useState(null);



    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await apiService[activeTab].getAll();
            console.log(apiService[activeTab].getAll())
            setData(result);
            setCurrentPage(1);
        } catch (err) {
            setError('Unable to load data. Please try again.');
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };
    const handleDelete = async (item) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                const primaryKey = Object.values(item)[0];
                await apiService[activeTab].delete(primaryKey);
                await fetchData();
                alert('Deleted successfully!');
            } catch (err) {
                alert('Error deleting. Please try again.');
                console.error('Error deleting:', err);
            }
        }
    };
    const handleSave = async (formData) => {
        try {
            if (modalMode === 'create') {
                await apiService[activeTab].create(formData);
                alert('Created successfully!');
            } else {
                const primaryKey = Object.values(formData)[0];
                await apiService[activeTab].update(primaryKey, formData);
                alert('Updated successfully!');
            }
            await fetchData();
            handleCloseModal();
        } catch (err) {
            alert(`Error ${modalMode === 'create' ? 'creating' : 'updating'}. Please try again.`);
            console.error('Error saving:', err);
        }
    };


    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setEditData(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditData(null);
    };

    const renderTable = () => {
        const currentTable = tableConfig.find((t) => t.key === activeTab);

        return (
            <div className="content-section">
                <h2 className="section-title">{currentTable.label}</h2>
                <p className="section-description">Manage {currentTable.label.toLowerCase()} data</p>

                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                {currentTable.columns.map((col) => (
                                    <th key={col.key}>{col.label}</th>
                                ))}
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentRows.length > 0 ? (
                                console.log(currentRows),
                                currentRows.map((item, index) => (
                                    <tr key={index}>
                                        {currentTable.columns.map((col) => (
                                            <td key={col.key}>{formatValue(item[col.key], col)}</td>
                                        ))}
                                        <td>
                                            <div className="action-buttons">
                                                <button className="btn-edit" onClick={() => handleOpenModal('edit', item)}>
                                                    Edit
                                                </button>
                                                <button className="btn-delete" onClick={() => handleDelete(item)}>
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={currentTable.columns.length + 1} className="no-data">
                                        {loading ? 'Loading data...' : error || 'No data available'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                                Prev
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i}
                                    className={currentPage === i + 1 ? 'active' : ''}
                                    onClick={() => setCurrentPage(i + 1)}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(currentPage + 1)}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };
    return (
        <div className="page-container">
            <div className="container">
                <div className="main-title-bar">
                    <h1 className="main-title">Photo Print Shop — Admin Panel</h1>
                    <div className="user-info">
                        <span>{user.username} (Admin)</span>
                        <button className="btn-logout" onClick={onLogout}>Logout</button>
                    </div>
                </div>

                <div className="tabs-container">
                    {tableConfig.map((table) => (
                        <button
                            key={table.key}
                            onClick={() => setActiveTab(table.key)}
                            className={`tab-button ${activeTab === table.key ? 'active' : ''}`}
                        >
                            {table.label}
                        </button>
                    ))}
                </div>
                <div className="content-container">
                    <div className="action-bar">
                        <button onClick={fetchData} className="btn-refresh">
                            Refresh
                        </button>
                        <button onClick={() => handleOpenModal('create')} className="btn-add">
                            Add New
                        </button>
                    </div>

                    {renderTable()}


                    <CreateEditModal
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        onSave={handleSave}
                        editData={editData}
                        tableConfig={tableConfig.find((t) => t.key === activeTab)}
                        mode={modalMode}
                    />
                </div>
            </div>
        </div>
    );
}

export default AdminPage;