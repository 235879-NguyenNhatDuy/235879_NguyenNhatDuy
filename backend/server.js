const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Kết nối MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Đã kết nối MongoDB Atlas thành công'))
  .catch(err => console.error('Lỗi kết nối MongoDB:', err));

// Định nghĩa Schema & Model Device
const deviceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  deviceType: { type: String, required: true },
  room: { type: String, required: true },
  brand: { type: String, default: '' },
  model: { type: String, default: '' },
  quantity: { type: Number, default: 1 },
  status: { 
    type: String, 
    enum: ['Đang sử dụng', 'Hư hỏng', 'Đang sửa chữa', 'Ngừng sử dụng'], 
    default: 'Đang sử dụng' 
  },
  purchaseDate: { type: String, default: '' },
  description: { type: String, default: '' }
}, { timestamps: true });

const Device = mongoose.model('Device', deviceSchema, 'devices');

// 1. GET /health - Kiểm tra trạng thái hoạt động backend
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend API đang hoạt động bình thường' });
});

// 2. GET /api/devices - Lấy danh sách & Tìm kiếm thiết bị (?search=...)
app.get('/api/devices', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      const regex = new RegExp(search, 'i');
      query = {
        $or: [
          { deviceId: regex },
          { name: regex },
          { deviceType: regex },
          { room: regex }
        ]
      };
    }
    const devices = await Device.find(query);
    res.json(devices);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
});

// 3. GET /api/devices/:id - Xem chi tiết một thiết bị
app.get('/api/devices/:id', async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
    }
    res.json(device);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
});

// 4. POST /api/devices - Thêm thiết bị mới (Validate & Kiểm tra trùng deviceId)
app.post('/api/devices', async (req, res) => {
  try {
    const { deviceId, name, deviceType, room } = req.body;
    if (!deviceId || !name || !deviceType || !room) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ deviceId, name, deviceType, room' });
    }

    const existingDevice = await Device.findOne({ deviceId });
    if (existingDevice) {
      return res.status(400).json({ message: 'Mã thiết bị (deviceId) đã tồn tại' });
    }

    const newDevice = new Device(req.body);
    await newDevice.save();
    res.status(201).json(newDevice);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
});

// 5. PUT /api/devices/:id - Cập nhật thông tin thiết bị
app.put('/api/devices/:id', async (req, res) => {
  try {
    const updatedDevice = await Device.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedDevice) {
      return res.status(404).json({ message: 'Không tìm thấy thiết bị để cập nhật' });
    }
    res.json(updatedDevice);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
});

// 6. DELETE /api/devices/:id - Xóa thiết bị
app.delete('/api/devices/:id', async (req, res) => {
  try {
    const deletedDevice = await Device.findByIdAndDelete(req.params.id);
    if (!deletedDevice) {
      return res.status(404).json({ message: 'Không tìm thấy thiết bị để xóa' });
    }
    res.json({ message: 'Xóa thiết bị thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
