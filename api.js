const express = require('express');
const multer = require('multer'); // Import thư viện multer để xử lý tải lên tập tin
const router = express.Router();
const mongoose = require('mongoose');
const COMMON = require('./COMMON');
const LaptopModel = require('./laptopModel');

const upload = require('./upload')
router.get('/',(req,res)=>{
    res.send('Vào xử lý API');
});

router.use(express.json());

router.get('/list', async (req, res) => {
    try {
        await mongoose.connect(COMMON.uri);
        console.log("Connected to MongoDB");

        let laptops = await LaptopModel.find();
        console.log("Retrieved laptops:", laptops);

        res.send(laptops);
    } catch (error) {
        console.error("Error retrieving laptops:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Route thêm laptop
router.post('/add', upload.array('image', 5), async (req, res) => {
   
try {
    const {ten,gia,hang,status} = req.body; // Lấy dữ liệu từ body
    const { files } = req //files nếu upload nhiều, file nếu upload 1 file
    const urlsImage =
        files.map((file) => `${req.protocol}://${req.get("host")}/uploads/${file.filename}`)
    //url hình ảnh sẽ được lưu dưới dạng: http://localhost:3000/upload/filename
        const newLaptop = new LaptopModel({
            ten: ten,
            gia: gia,
            hang: hang,
            anhUrl: urlsImage,
            status: status
        });
    const result = (await newLaptop.save()); //Thêm vào database
    if (result) {// Nếu thêm thành công result !null trả về dữ liệu
        res.json({
            "status": 200,
            "messenger": "Thêm thành công",
            "data": result
        })
    } else {// Nếu thêm không thành công result null, thông báo không thành công
        res.json({
            "status": 400,
            "messenger": "Lỗi, thêm không thành công",
            "data": []
        })
    }
} catch (error) {
    console.log(error);
}
});


// Route xóa laptop
router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await LaptopModel.findByIdAndDelete(id);
        res.json({ message: 'Xóa laptop thành công' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route cập nhật thông tin laptop
router.put('/update/:id', upload.array('image', 5), async (req, res) => {
    try {
        const { id } = req.params;
        console.log('ID laptop cần chỉnh sửa:', id); 
        const { files } = req;
        const { ten, gia, hang, anhUrl,status } = req.body;
        let url1;
        const updateLaptop = await LaptopModel.findById(id)
        if (files && files.length > 0) {
            url1 = files.map((file) => `${req.protocol}://${req.get("host")}/uploads/${file.filename}`);

        }
        if (url1 == null) {
            url1 = updateLaptop.anhUrl;
        }

        let result = null;
        if (updateLaptop) {
            updateLaptop.ten = ten ??  updateLaptop.ten,
            updateLaptop.gia = gia ?? updateLaptop.gia,
            updateLaptop.hang = hang ??  updateLaptop.hang,
            updateLaptop.status = status ??  updateLaptop.status,


            updateLaptop.anhUrl = url1,

                result = (await updateLaptop.save());
        }
        if (result) {
            res.json({
                'status': 200,
                'messenger': 'Cập nhật thành công',
                'data': result
            })
        } else {
            res.json({
                'status': 400,
                'messenger': 'Cập nhật không thành công',
                'data': []
            })
        }
    } catch (error) {
        console.log(error);
    }
});

router.get('/search', async (req, res) => {
    try {
        const key = req.query.key;

        console.log(key);
        const data = await LaptopModel.find({ ten: { "$regex": key, "$options": "i" } })
            .sort({ createdAt: -1 })
            .maxTimeMS(30000); // Thời gian chờ tối đa 30 giây
        if (data.length > 0) { // Kiểm tra xem có kết quả tìm kiếm không
            res.json({
                "status": 200,
                "messenger": "Thành công",
                "data": data
            });
        } else {
            res.json({
                "status": 400,
                "messenger": "Không có kết quả phù hợp",
                "data": []
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            "status": 500,
            "messenger": "Đã xảy ra lỗi khi tìm kiếm",
            "data": []
        });
    }
});


module.exports = router;
