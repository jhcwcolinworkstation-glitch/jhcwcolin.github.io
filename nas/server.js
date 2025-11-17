const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = 30000;

// *** 请注意：这里是您的共享目录，必须是 C:\NAS ***
const NAS_ROOT = 'C:\\NAS'; 

// 确保NAS目录存在 (如果不存在就创建它)
if (!fs.existsSync(NAS_ROOT)) {
    fs.mkdirSync(NAS_ROOT, { recursive: true });
}

// --- 配置模板引擎和文件上传 ---
app.set('view engine', 'ejs');
// EJS 模板将存放在名为 'views' 的子文件夹中
app.set('views', path.join(__dirname, 'views'));

// Multer 配置：文件将直接存储到 NAS_ROOT 目录下
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, NAS_ROOT); 
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });


// --- 路由 (网页地址) ---

// 1. 首页：显示文件列表
app.get('/', (req, res) => {
    fs.readdir(NAS_ROOT, { withFileTypes: true }, (err, files) => {
        if (err) return res.status(500).send('无法读取共享目录。');

        const fileList = files.map(file => ({
            name: file.name,
            isDirectory: file.isDirectory(),
            isFile: file.isFile(),
        }));
        // 渲染 views/index.ejs
        res.render('index', { files: fileList });
    });
});

// 2. 文件上传处理
app.post('/upload', upload.single('nasFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('未选择文件。');
    }
    console.log(`文件上传成功: ${req.file.originalname}`);
    res.redirect('/'); // 上传完成后回到首页
});


// 3. 文件下载 (共享文件)
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    // path.join 确保路径正确
    const filePath = path.join(NAS_ROOT, filename); 

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            return res.status(404).send('文件未找到。');
        }
        // res.download() 会自动处理下载过程
        res.download(filePath, (err) => {
            if (err && !res.headersSent) {
                res.status(500).send('文件下载失败。');
            }
        });
    });
});


// --- 启动服务器 ---
app.listen(PORT, () => {
    console.log(`🎉 NAS服务器运行在：http://localhost:${PORT}`);
    console.log(`共享目录：${NAS_ROOT}`);
});