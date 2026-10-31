import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialForm = {
    deviceId: '',
    name: '',
    deviceType: '',
    room: '',
    brand: '',
    model: '',
    quantity: 1,
    status: 'Đang sử dụng',
    purchaseDate: '',
    description: ''
  };

  const [formData, setFormData] = useState(initialForm);

  const fetchDevices = async (keyword = '') => {
    setLoading(true);
    setError('');
    try {
      const url = keyword ? `${API_URL}/api/devices?search=${encodeURIComponent(keyword)}` : `${API_URL}/api/devices`;
      const res = await axios.get(url);
      setDevices(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể kết nối đến máy chủ API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDevices(search);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormData(initialForm);
    setIsFormOpen(true);
  };

  const openEditForm = (device) => {
    setEditingId(device._id);
    setFormData({
      deviceId: device.deviceId,
      name: device.name,
      deviceType: device.deviceType,
      room: device.room,
      brand: device.brand || '',
      model: device.model || '',
      quantity: device.quantity || 1,
      status: device.status || 'Đang sử dụng',
      purchaseDate: device.purchaseDate || '',
      description: device.description || ''
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      if (editingId) {
        await axios.put(`${API_URL}/api/devices/${editingId}`, formData);
        setMessage('Cập nhật thông tin thiết bị thành công!');
      } else {
        await axios.post(`${API_URL}/api/devices`, formData);
        setMessage('Thêm mới thiết bị thành công!');
      }
      setIsFormOpen(false);
      fetchDevices(search);
    } catch (err) {
      setError(err.response?.data?.message || 'Thao tác không thành công');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thiết bị này?')) return;
    setMessage('');
    setError('');
    try {
      await axios.delete(`${API_URL}/api/devices/${id}`);
      setMessage('Xóa thiết bị thành công!');
      fetchDevices(search);
    } catch (err) {
      setError(err.response?.data?.message || 'Xóa thiết bị thất bại');
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Đang sử dụng': return 'badge success';
      case 'Hư hỏng': return 'badge danger';
      case 'Đang sửa chữa': return 'badge warning';
      case 'Ngừng sử dụng': return 'badge dark';
      default: return 'badge';
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Quản Lý Thiết Bị Phòng Học</h1>
        <p>Hệ thống theo dõi & quản lý thiết bị trên nền tảng đám mây</p>
      </header>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="toolbar">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Tìm theo mã, tên, loại, phòng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary">Tìm kiếm</button>
        </form>
        <button onClick={openAddForm} className="btn btn-primary">+ Thêm thiết bị</button>
      </div>

      {loading ? (
        <div className="loading">Đang tải dữ liệu thiết bị...</div>
      ) : (
        <table className="device-table">
          <thead>
            <tr>
              <th>Mã TB</th>
              <th>Tên thiết bị</th>
              <th>Loại</th>
              <th>Phòng</th>
              <th>Số lượng</th>
              <th>Tình trạng</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {devices.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>Không có dữ liệu thiết bị</td>
              </tr>
            ) : (
              devices.map((dev) => (
                <tr key={dev._id}>
                  <td><strong>{dev.deviceId}</strong></td>
                  <td>{dev.name}</td>
                  <td>{dev.deviceType}</td>
                  <td>{dev.room}</td>
                  <td>{dev.quantity}</td>
                  <td>
                    <span className={getStatusClass(dev.status)}>{dev.status}</span>
                  </td>
                  <td>
                    <button onClick={() => setSelectedDevice(dev)} className="btn-sm btn-info">Xem</button>
                    <button onClick={() => openEditForm(dev)} className="btn-sm btn-warning">Sửa</button>
                    <button onClick={() => handleDelete(dev._id)} className="btn-sm btn-danger">Xóa</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {selectedDevice && (
        <div className="modal-overlay" onClick={() => setSelectedDevice(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Chi Tiết Thiết Bị: {selectedDevice.deviceId}</h3>
            <div className="detail-grid">
              <p><strong>Tên thiết bị:</strong> {selectedDevice.name}</p>
              <p><strong>Loại thiết bị:</strong> {selectedDevice.deviceType}</p>
              <p><strong>Phòng học:</strong> {selectedDevice.room}</p>
              <p><strong>Hãng sản xuất:</strong> {selectedDevice.brand || 'N/A'}</p>
              <p><strong>Model:</strong> {selectedDevice.model || 'N/A'}</p>
              <p><strong>Số lượng:</strong> {selectedDevice.quantity}</p>
              <p><strong>Tình trạng:</strong> <span className={getStatusClass(selectedDevice.status)}>{selectedDevice.status}</span></p>
              <p><strong>Ngày tiếp nhận:</strong> {selectedDevice.purchaseDate || 'N/A'}</p>
              <p className="full-width"><strong>Mô tả:</strong> {selectedDevice.description || 'Không có ghi chú'}</p>
            </div>
            <div style={{ marginTop: '16px', textAlign: 'right' }}>
              <button onClick={() => setSelectedDevice(null)} className="btn btn-secondary">Đóng</button>
            </div>
          </div>
        </div>
      )}

      {isFormOpen && (
        <div className="modal-overlay" onClick={() => setIsFormOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingId ? 'Cập Nhật Thông Tin Thiết Bị' : 'Thêm Thiết Bị Mới'}</h3>
            <form onSubmit={handleSubmit} className="form-grid">
              <div className="form-group">
                <label>Mã thiết bị (*):</label>
                <input
                  type="text"
                  name="deviceId"
                  value={formData.deviceId}
                  onChange={handleInputChange}
                  required
                  disabled={!!editingId}
                />
              </div>
              <div className="form-group">
                <label>Tên thiết bị (*):</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Loại thiết bị (*):</label>
                <input
                  type="text"
                  name="deviceType"
                  value={formData.deviceType}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phòng học (*):</label>
                <input
                  type="text"
                  name="room"
                  value={formData.room}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Hãng sản xuất:</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Model:</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Số lượng:</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Tình trạng:</label>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="Đang sử dụng">Đang sử dụng</option>
                  <option value="Hư hỏng">Hư hỏng</option>
                  <option value="Đang sửa chữa">Đang sửa chữa</option>
                  <option value="Ngừng sử dụng">Ngừng sử dụng</option>
                </select>
              </div>
              <div className="form-group">
                <label>Ngày tiếp nhận:</label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group full-width">
                <label>Mô tả / Ghi chú:</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              <div className="form-actions full-width">
                <button type="submit" className="btn btn-primary">{editingId ? 'Cập nhật' : 'Lưu mới'}</button>
                <button type="button" onClick={() => setIsFormOpen(false)} className="btn btn-secondary">Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
