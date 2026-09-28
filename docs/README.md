# 📚 TÀI LIỆU DỰ ÁN BER-ARENA

Chào mừng bạn đến với trung tâm tài liệu và theo dõi tiến độ của dự án **Ber-Arena**.

---

## 📑 MỤC LỤC TÀI LIỆU

1. [ARCHITECTURE_VISION.md](file:///e:/Ber-Arena/docs/ARCHITECTURE_VISION.md):  
   Bản thiết kế kiến trúc kỹ thuật & 5 trụ cột Backend chuyên sâu (Server-Authoritative FSM, Concurrency & Optimistic Lock, Horizontal Scaling, Transactional Outbox, Polyglot Persistence & Worker Threads).

2. [ROADMAP_4_WEEKS.md](file:///e:/Ber-Arena/docs/ROADMAP_4_WEEKS.md):  
   Kế hoạch chi tiết 4 tuần (28 ngày) phân bổ từng ngày với:
   - Mục tiêu micro-tasking (< 50 dòng code/bước).
   - Kiến thức & công nghệ cốt lõi cần nắm vững (Deep understanding).
   - Danh sách file tạo ra & commit message chuẩn convention.
   - Cách kiểm thử (verify) cụ thể.

3. [GIT_CONVENTIONS.md](file:///e:/Ber-Arena/docs/GIT_CONVENTIONS.md):  
   Quy ước commit Monorepo chuẩn Conventional Commits, phân định rõ ràng giữa backend, frontend, infra và docs.

4. [PROGRESS_TRACKER.md](file:///e:/Ber-Arena/docs/PROGRESS_TRACKER.md):  
   Bảng checklist cập nhật trạng thái thực thi từng ngày (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `BLOCKED`) và nhật ký kỹ thuật hàng ngày.

---

## 🧭 CÁCH THỨC LÀM VIỆC TỪNG BƯỚC VỚI AI

Để đảm bảo hiệu quả cao nhất theo phương pháp **Micro-Tasking**:
1. **Chọn đúng 1 bước duy nhất** theo thứ tự từ Ngày 1 đến Ngày 28 (Ví dụ: `Bước 1.1: Docker Compose đa dịch vụ & Healthcheck`).
2. Yêu cầu AI:  
   *"Hãy cùng tôi làm Bước 1.1: Viết file docker/docker-compose.yml. Giải thích cho tôi ý nghĩa từng dòng cấu hình và cách kiểm tra."*
3. Đọc hiểu 100% bản chất kỹ thuật, tự tay kiểm tra (verify) bằng terminal.
4. Chạy lệnh Git commit đúng quy chuẩn đã ghi trong bảng kế hoạch.
5. Cập nhật trạng thái `COMPLETED` trong [PROGRESS_TRACKER.md](file:///e:/Ber-Arena/docs/PROGRESS_TRACKER.md) trước khi sang bước tiếp theo.
