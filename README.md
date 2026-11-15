# Focus Flow — Phòng học của bạn

Ứng dụng học tập React + TypeScript: Pomodoro, việc học và tiến độ. Giao diện hỗ trợ tiếng Việt/English, ba bảng màu sáng/tối, góc học minh họa và ba cảnh ảnh thư viện, quán cà phê, rừng mưa.

## Chạy local

Node.js 22.12 trở lên.

```sh
npm ci
npm run dev
```

Vite chạy tại http://localhost:5173. Build bằng `npm run build`; thư mục xuất là `dist/`.

## Kiểm tra

```sh
npm run typecheck
npm run lint
npm test
npx playwright install chromium
npm run test:e2e
npx playwright test --config playwright.cloud.config.ts
npm run build
```

Kiểm thử gồm vòng lặp Pomodoro, chống ghi nhận trùng, tải lại trang, đổi ngôn ngữ, cảnh ảnh 320–1920px, khôi phục sao lưu, cửa sổ mini và đồng bộ API mô phỏng. Bộ kiểm thử cloud chạy máy chủ riêng cổng 5174 và không gửi dữ liệu ra dịch vụ thật.

## Các tính năng

- Pomodoro tự chuyển tập trung → nghỉ ngắn; đủ số phiên thì nghỉ dài, sau đó tiếp tục học. Lựa chọn cũ được giữ; bật “Tự động lặp chu kỳ” trong Cài đặt nếu cần.
- Deadline được lưu theo thời gian thực. Khi tab bị chậm, ứng dụng tính lại theo deadline và ghi mỗi phiên một lần. Sau tối đa 1.000 lần chuyển bù, vòng lặp tạm dừng để kiểm tra. Tạm dừng không tính thời gian đã dừng; reset/bỏ qua không ghi nhận phiên chưa xong.
- Tiếng Việt/English áp dụng cho UI, tên tab, nhãn truy cập, ngày tháng và thông báo. Tên việc học do người dùng nhập giữ nguyên.
- Đồng hồ nổi dùng Document Picture-in-Picture nếu trình duyệt hỗ trợ; nếu không, mở cửa sổ mini thông thường. Cửa sổ thường không được bảo đảm luôn nổi trên ứng dụng khác. Đóng trang chính sẽ kết thúc cửa sổ mini.
- Cảnh ảnh nằm riêng với đồng hồ và chữ. Âm mưa tổng hợp bằng Web Audio chỉ phát sau thao tác bật; có điều chỉnh âm lượng.
- Xuất/nhập JSON kiểm tra phiên bản và dữ liệu trước khi hiển thị bước xác nhận thay thế. Phiên đang chạy trong tệp được khôi phục ở trạng thái tạm dừng.
- Cài đặt xem trước bảng màu; Hủy/Esc trả về màu đã lưu. Đổi thời lượng không cắt ngang phiên đang chạy.

Dữ liệu local ở localStorage. Hiện chưa phối hợp chỉnh sửa nhiều tab cùng lúc; nên chạy đồng hồ trên một tab chính. Các trình duyệt có thể hạn chế timer, âm thanh và thông báo ở nền. Tên tab không thể tiếp tục hiển thị khi trình duyệt đã đóng.

## Kích hoạt đồng bộ Supabase

Phần client và migration đã có; chưa kết nối dự án Supabase thật. Đồng bộ là thao tác người dùng yêu cầu, không tự tải dữ liệu cá nhân lên khi chưa chọn.

1. Chọn một dự án Supabase thuộc tài khoản của bạn.
2. Chạy `supabase/migrations/202611150001_study_backups.sql` trên dự án đó. Migration tạo bảng theo user, bật RLS và hàm cập nhật có kiểm tra revision. Mỗi tài khoản chỉ được truy cập dữ liệu của mình.
3. Sao chép `.env.example` thành `.env.local`, đặt `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY`. Chỉ dùng khóa public/anon; không đặt service-role key trong biến bắt đầu bằng VITE_.
4. Bật đăng nhập email và thêm URL local/production vào Auth → URL Configuration.
5. Đặt cùng hai biến môi trường public trên Vercel rồi build lại.
6. Kiểm tra bằng hai tài khoản thật để xác nhận cách ly dữ liệu và hai thiết bị để xác nhận tải/lưu. Các kiểm tra này chưa được thực hiện vì thiếu dự án thật.

Khi đã kết nối: Cài đặt → Đồng bộ & sao lưu → đăng nhập bằng liên kết email → Kiểm tra bản đám mây → Lưu hoặc Tải về. Lưu gửi revision đã đọc; nếu thiết bị khác vừa cập nhật thì thao tác bị từ chối để tránh ghi đè. Tải về cần xác nhận thay thế. Đồng hồ đang chạy không được chia sẻ lên cloud.

## Git và Vercel

Mã đã push lên nhánh `codex/focus-flow-release` của `trist2-8/stillpoint-study-focus`. Lịch sử local và nhánh main gốc khác nhau nên chưa ghi đè main.

`vercel.json` cấu hình Vite và SPA fallback. `.vercelignore` loại dữ liệu kiểm thử, file tạm và biến môi trường local khỏi gói tải lên. Triển khai production chưa hoàn tất: bước cấp quyền chạy lệnh triển khai bị hết thời gian. Sau khi quyền chạy và cấu hình Supabase sẵn sàng, chạy `npx vercel --prod`, rồi kiểm tra URL production, tải trực tiếp /tasks, /insights, ảnh và favicon.

## Tài nguyên

Ảnh tải từ Unsplash; URL gốc được ghi tại `public/rooms/SOURCES.md`. Tạo ảnh qua Fosta đã thử nhưng thất bại do cấu hình thiếu khóa; không có ảnh AI được tạo trong lần cập nhật này. Minh họa góc học mặc định là SVG có sẵn trong dự án.
