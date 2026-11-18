import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function initDatabase() {
  try {
    // Kết nối MySQL chưa chỉ định database để chạy lệnh CREATE DATABASE IF NOT EXISTS
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true,
    });

    const sqlPath = path.join(__dirname, '../../database.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('Đang thực thi script khởi tạo database.sql...');
    await connection.query(sqlContent);
    console.log('Khởi tạo cơ sở dữ liệu quiz_web_db và dữ liệu mẫu thành công!');

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi khởi tạo cơ sở dữ liệu:', error);
    process.exit(1);
  }
}

initDatabase();

