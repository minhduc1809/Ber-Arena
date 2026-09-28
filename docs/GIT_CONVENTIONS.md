# 📜 QUY ƯỚC COMMIT CHUẨN MONOREPO (CHRONO ARENA COMMIT CONVENTION)

Để quản lý cả **Backend**, **Frontend**, **Hạ tầng (Infra)** và **Tài liệu (Docs)** trong cùng 1 Git Repository một cách chuyên nghiệp, dự án Chrono Arena áp dụng chuẩn **Conventional Commits** mở rộng cho mô hình Monorepo.

---

## 🏷️ CẤU TRÚC THÔNG ĐIỆP COMMIT (COMMIT MESSAGE FORMAT)

```text
<type>(<scope>): <mô tả ngắn gọn chức năng / thay đổi>

[Tùy chọn: Thân commit (Body) giải thích chi tiết tại sao và như thế nào]
[Tùy chọn: Footer ghi issue liên quan hoặc Breaking Changes]
```

Ví dụ nhanh:
- `feat(backend/auth): implement refresh token rotation with redis`
- `feat(frontend/arena): add 4x5 tactical grid component`
- `feat(infra): setup docker-compose with postgres mongo redis`
- `docs(roadmap): update sprint 1 progress tracker`

---

## 📌 1. CÁC LOẠI COMMIT (`<type>`)

| Type | Mục đích sử dụng |
| :--- | :--- |
| **`feat`** | Thêm một tính năng mới (Feature) |
| **`fix`** | Sửa một lỗi (Bug fix) |
| **`refactor`** | Tái cấu trúc mã nguồn (không sửa lỗi, không thêm tính năng mới) |
| **`perf`** | Cải thiện hiệu năng (Performance improvement) |
| **`test`** | Thêm hoặc sửa mã kiểm thử (Unit test, Integration test, k6 load test) |
| **`docs`** | Thêm hoặc cập nhật tài liệu (Documentation, README, Kế hoạch) |
| **`chore`** | Các công việc bảo trì (Cập nhật dependencies, cấu hình `.gitignore`, build script) |
| **`infra`** | Hạ tầng, container, docker-compose, CI/CD pipeline |

---

## 🎯 2. ĐỊNH NGHĨA PHẠM VI (`<scope>`) TRONG MONOREPO

Quy tắc: **Scope phải chỉ rõ khu vực mã nguồn được thay đổi**:

### 🔹 Phân hệ Backend: `backend/<module>` hoặc `backend`
- `backend/auth`: Đăng ký, đăng nhập, JWT, refresh token rotation.
- `backend/wallet`: Quản lý ví, giao dịch nạp/trừ tiền an toàn.
- `backend/auction`: Chợ đấu giá, lock, outbid, anti-sniping.
- `backend/game`: Core FSM, action handlers, turn timer.
- `backend/socket`: WebSocket gateway, Redis adapter, reconnection.
- `backend/matchmaking`: Hàng đợi ELO, ZSET, BullMQ dynamic expansion, Lua script.
- `backend/outbox`: Transactional Outbox pattern, event publisher.
- `backend/replay`: MongoDB event sourcing, worker threads verification.
- `backend/db`: Prisma schema, migration, indexing, RLS extension.

### 🔸 Phân hệ Frontend: `frontend/<feature>` hoặc `frontend`
- `frontend/auth`: Form đăng nhập, đăng ký, lưu token.
- `frontend/arena`: Bàn cờ $4 \times 5$, hiển thị lính, dùng phép, đồng hồ lượt 30s.
- `frontend/auction`: Giao diện danh sách đấu giá, nút bid, countdown timer.
- `frontend/wallet`: Widget hiển thị số dư vàng realtime.
- `frontend/socket`: Kết nối socket.io client, xử lý reconnect.
- `frontend/replay`: Màn hình xem lại trận đấu.

### 🌐 Hạ tầng & Toàn cục (Root / Infra / Docs):
- `infra`: Docker compose, Dockerfile, Nginx reverse proxy.
- `docs`: Tài liệu hướng dẫn, kế hoạch, diagram.
- `repo`: Cấu hình cấp cao của repository (Root `.gitignore`, Root README, cấu hình monorepo).

---

## 💡 BẢNG VÍ DỤ MINH HỌA CHI TIẾT THEO TỪNG TÌNH HUỐNG

### 1. Khi làm việc với Backend:
```bash
# Thêm tính năng đăng nhập với JWT
git commit -m "feat(backend/auth): implement jwt auth with refresh token rotation"

# Sửa lỗi trừ tiền bị race condition ở ví
git commit -m "fix(backend/wallet): prevent negative balance using optimistic locking"

# Thêm bộ test cho máy trạng thái game
git commit -m "test(backend/game): add unit test suite for 4x5 board transitions"

# Tối ưu hóa truy vấn Redis ZSET khi tìm trận
git commit -m "perf(backend/matchmaking): optimize dynamic elo search with lua script"
```

### 2. Khi làm việc với Frontend:
```bash
# Tạo giao diện bàn cờ 4x5
git commit -m "feat(frontend/arena): render 4x5 grid with drag-and-drop card interaction"

# Sửa lỗi đồng hồ đếm ngược 30s không dừng khi kết thúc lượt
git commit -m "fix(frontend/arena): resolve turn timer desync on socket reconnection"

# Cài đặt kết nối WebSocket client
git commit -m "feat(frontend/socket): integrate socket.io client with jwt auth handshake"
```

### 3. Khi làm việc với Hạ tầng (Docker / DB / Repo Root):
```bash
# Cấu hình file .gitignore cho toàn repo
git commit -m "chore(repo): configure root gitignore for monorepo"

# Tạo docker-compose cho Postgres, Mongo, Redis
git commit -m "feat(infra): setup docker-compose with postgres, mongo and redis"

# Cập nhật bảng theo dõi tiến độ
git commit -m "docs(progress): mark sprint 1 step 1.1 as completed"
```

---

## 🚫 CÁC LỖI COMMIT CẦN TRÁNH

1. ❌ **Commit chung chung, không rõ phạm vi**:
   - *Sai*: `git commit -m "update code"`
   - *Đúng*: `feat(backend/auction): add idempotency guard with redis`
2. ❌ **Trộn lẫn cả Frontend và Backend trong 1 commit tính năng**:
   - Nếu bạn code cả 2 bên cho tính năng đấu giá:
     - Tách thành 2 commit:
       1. `feat(backend/auction): add place-bid endpoint with redis lock`
       2. `feat(frontend/auction): add live bidding component and countdown`
3. ❌ **Để lọt file rác (`node_modules`, `.env`, build files)**:
   - Luôn kiểm tra `git status` trước khi `git add .` để đảm bảo file `.gitignore` đã hoạt động chính xác.
