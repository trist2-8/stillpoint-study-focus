# Focus Flow — hướng thiết kế

Ứng dụng cá nhân chỉ phục vụ học tập, Pomodoro và theo dõi tiến độ. Giao diện dùng tiếng Việt thống nhất; Focus Flow và Pomodoro là tên riêng. Nội dung người dùng tự nhập giữ nguyên.

## Quy tắc giao diện

- Đồng hồ và hành động bắt đầu là trọng tâm. Tranh phòng học nằm ở vùng riêng, không đè lên chữ và điều khiển.
- Bảng màu Hoa oải hương, Đêm xanh và Rừng yên tĩnh hỗ trợ cả sáng/tối. Người mới mở ứng dụng mặc định dùng tối; lựa chọn đã lưu được giữ nguyên.
- Chữ chính và phụ dùng token màu có độ tương phản rõ trên bề mặt đặc. Không dùng blur, opacity hay text-shadow cho nội dung.
- Bố cục chuyển về một cột trên màn hình nhỏ. Cài đặt luôn truy cập được từ thanh điều hướng di động.
- Lịch học: mỗi ô là một ngày, mức màu theo số phiên tập trung hoàn tất (0, 1, 2, 3, 4+). Chọn ô để đọc ngày, số phiên, thời lượng. Hai trang dùng chung thành phần và cách tính.
- Ngày không học không vẽ cột giả. Trạng thái trống hướng dẫn hoàn tất phiên đầu tiên.
- Chuyển động tôn trọng prefers-reduced-motion.

## Skill đã cài trên máy

- anthropics/skills: frontend-design, webapp-testing, web-artifacts-builder.
- sergekostenchuk/ui-ux-agent-skill-system: design-critic-skill, ux-audit-skill, webapp-ui-skill.
- educlopez/ui-craft: ui-craft, ui-craft-minimal.
- sugarforever/open-design-skill: open-design-skill.

Đã áp dụng trực tiếp frontend-design (phân cấp và nội dung), UI Craft (bố cục, màu, chữ, khả năng truy cập), design-critic (phát hiện chồng lấn và hành động cạnh tranh), webapp-testing (kiểm tra trình duyệt). Các skill còn lại đã cài để dùng khi phù hợp; Open Design chưa tải kho nội dung thương hiệu riêng.

Kiểm tra bằng Playwright: thao tác đồng hồ, thêm/sửa việc, lưu bảng màu, lịch học sau phiên hoàn tất, ba tuyến trên desktop/mobile trong cả sáng/tối. Không gửi ảnh hoặc dữ liệu học tập lên dịch vụ đánh giá bên ngoài.
