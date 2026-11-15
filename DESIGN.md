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

## Sửa lỗi căn khung và kiểm định trực tiếp

Skill bổ sung từ alirezarezvani/claude-skills: senior-fullstack, senior-frontend, ui-design-system, ux-researcher-designer và design-qa. Đã đọc và áp dụng hướng dẫn phù hợp với ứng dụng React/Vite hiện có; không thêm máy chủ hoặc thay mô hình lưu dữ liệu chỉ để dùng một skill.

Các lỗi quan sát được trên bản cũ: thanh bên có min-height 730px làm nút thu gọn tràn khỏi khung ở 1280×720; nội dung đồng hồ rộng 84% nhưng neo lệch về trái; nút bắt đầu cao 52px còn nút phụ 44px; hình SVG có tọa độ âm ngoài viewBox; ba file CSS cùng định nghĩa bố cục Focus.

Bố cục hiện tại: reference.css quản lý thanh bên và khung ứng dụng; focus.css quản lý trang tập trung; palettes.css quản lý màu. Tranh và đồng hồ nằm trong hai ô grid riêng. Thanh bên có thể cuộn khi màn hình thấp, các điểm chuyển giữa desktop/mobile thống nhất ở 760px. Đồng hồ, ô chọn việc và nhóm điều khiển cùng một trục. Dùng tiêu đề h1 hiển thị và chừa khoảng cuộn cho thanh điều hướng cố định khi dùng bàn phím.

Kiểm thử hồi quy trong e2e/layout.spec.ts đo: sai lệch tâm đồng hồ dưới 1px; ba nút cùng mép trên/dưới; ô chọn việc và nhóm nút cùng chiều rộng; các khung cùng hàng có cùng mép trên/dưới; nút thu gọn nằm trong thanh bên; không cuộn ngang từ 320 đến 1920px. Bao gồm trạng thái thu gọn, tên việc dài, đồng hồ 180 phút và điều hướng bàn phím trên điện thoại.
