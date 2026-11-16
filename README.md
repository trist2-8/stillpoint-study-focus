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

Khi đã kết nối: Cài đặt → Sao lưu của bạn → Đồng bộ tài khoản (tùy chọn) → đăng nhập bằng liên kết email → Kiểm tra bản đám mây → Lưu hoặc Tải về. Lưu gửi revision đã đọc; nếu thiết bị khác vừa cập nhật thì thao tác bị từ chối để tránh ghi đè. Tải về cần xác nhận thay thế. Đồng hồ đang chạy không được chia sẻ lên cloud.

## Git và Vercel

Mã đã push lên nhánh `codex/focus-flow-release` của `trist2-8/stillpoint-study-focus`. Lịch sử local và nhánh main gốc khác nhau nên chưa ghi đè main.

`vercel.json` cấu hình Vite và SPA fallback. `.vercelignore` loại dữ liệu kiểm thử, file tạm và biến môi trường local khỏi gói tải lên. Website production: https://focus-flow-delta-khaki.vercel.app. Dự án Vercel `binko/focus-flow` đã liên kết ở máy này. Sau khi build/test đạt, chạy `npx vercel --prod`, rồi kiểm tra bản render production, tải trực tiếp /tasks, /insights, ảnh và favicon. Các tính năng cá nhân không cần cấu hình Supabase.

## Tài nguyên

Ảnh tải từ Unsplash; URL gốc được ghi tại `public/rooms/SOURCES.md`. Tạo ảnh qua Fosta đã thử nhưng thất bại do cấu hình thiếu khóa; không có ảnh AI được tạo trong lần cập nhật này. Minh họa góc học mặc định là SVG có sẵn trong dự án.

## Bàn học cá nhân

Trang Hôm nay ưu tiên một việc đang dang dở, mục tiêu phiên, đồng hồ và sổ ghi nhớ. Tạo môn học để tách việc học, ghi chú và lịch sử. Khi quay lại một môn, ứng dụng ưu tiên việc chưa hoàn thành đã học gần nhất; nếu chưa có lịch sử, chọn theo hạn rồi mức ưu tiên.

Sau một phiên tập trung hoàn tất, sổ ghi nhớ cho phép ghi điều đã làm, phần còn vướng, bước tiếp theo và mức mệt. Nội dung nhập được lưu thành bản nháp trên máy. Bấm Lưu nhật ký để đưa vào tổng kết; bản đã lưu có thể mở lại để sửa. Môn và mục tiêu được chụp vào lịch sử phiên, nên sửa môn của việc học sau này không làm thay đổi thống kê cũ.

Khay Để sau phiên học ghi nhanh ý nghĩ chen ngang và đánh dấu đã xử lý. Tổng kết tuần tính bảy ngày theo giờ địa phương, chỉ dùng phiên tập trung đã hoàn tất. Khung giờ thường học chỉ xuất hiện từ ba phiên; gợi ý về nhịp học cần ba nhật ký đã lưu và không tự thay thời lượng. Biểu đồ cũ nằm trong mục mở rộng.

Dữ liệu mới nằm ở trường personal trong cùng phong bì localStorage/backup v1; bản cũ không có trường này vẫn nhập được. Các bản sao lưu mới bao gồm môn học, nhật ký, bản nháp và ghi nhanh. Không tạo tài khoản hoặc tải dữ liệu lên cloud để sử dụng các tính năng cá nhân. Đồng bộ sẵn có được chuyển vào mục tùy chọn.

## Thế giới học

Nút **Đổi thế giới** mở sáu không gian: Hiên mây tím, Thư viện tĩnh, Nhà bên rừng, Đài quan sát đêm, Quán bên mưa và Góc ôn thi. Xem thử trực tiếp, đánh dấu yêu thích, chọn sáng/tối/hệ thống và bật/tắt chuyển động. Hủy hoặc Esc trả lại lựa chọn trước đó; Áp dụng lưu trên máy. Giao diện tôn trọng chế độ giảm chuyển động của thiết bị.

**Toàn cảnh** mở cảnh học lớn; **Bàn học** giữ bố cục làm việc ban đầu. **Sổ học** mở nhật ký trong chế độ toàn cảnh; sổ tự hiện khi đến giờ nghỉ. Chọn mục tiêu hoặc môn học không tự đổi thế giới. Thay giao diện không khởi tạo lại timer, bản nháp công việc hay bộ lọc tổng kết.

Đồng hồ nổi mặc định 280×160, ưu tiên chữ số khi thu nhỏ. Đã có kiểm thử cả Document Picture-in-Picture và cửa sổ dự phòng từ 120×60 đến 320×180, gồm bộ đếm 180 phút. Khi thu nhỏ cửa sổ thành biểu tượng trên thanh tác vụ, hệ điều hành không còn hiển thị nội dung cửa sổ.

Các cảnh dùng thành phần vector trong ứng dụng, không tải tài nguyên Innook. Trang tham khảo không mở được do quyền truy cập lưu trong ứng dụng. Fosta được thử lại ngày 16/11/2026 nhưng thiếu khóa cấu hình, nên không có ảnh AI mới. Tiêu chí PDF được tổng hợp trong AGENTS.md; không cần PDF để tiếp tục phát triển.
