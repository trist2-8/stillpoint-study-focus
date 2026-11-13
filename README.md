# Stillpoint — Study Focus

Một Pomodoro chỉ dành cho học tập, xây dựng bằng HTML/CSS/JavaScript thuần nên có thể deploy trực tiếp trên Vercel.

## Chạy local

```bash
python -m http.server 4173
```

Mở `http://localhost:4173`.

## Deploy Vercel

1. Push thư mục này lên GitHub.
2. Vào Vercel → **Add New Project** → chọn repository.
3. Framework Preset: **Other**.
4. Build Command để trống, Output Directory: `.`.
5. Deploy.

## Có sẵn

- Timer Pomodoro 25 / 5 / 15 phút với vòng tiến độ.
- Bắt đầu, tạm dừng, đặt lại và âm báo hoàn thành.
- Study queue có checkbox và thêm việc.
- Thay đổi mục tiêu học trong ngày.
- Thống kê thời gian tập trung trong tuần.
- Responsive cho desktop và mobile.

