# 📊 BER-ARENA - BẢNG THEO DÕI TIẾN ĐỘ THỰC THI (PROGRESS TRACKER)

> **Cập nhật lần cuối**: 2026-09-28  
> **Trạng thái**:  
> - ⏳ `PENDING` (Chưa bắt đầu)  
> - 🔄 `IN_PROGRESS` (Đang thực hiện)  
> - ✅ `COMPLETED` (Đã hoàn thành & Đã Verify)  
> - ⚠️ `BLOCKED` (Gặp lỗi / Cần giải quyết)

---

## 📈 TỔNG QUAN TIẾN ĐỘ

- **Sprint 1 (Tuần 1)**: `6 / 8 Tasks` (75.0%)
- **Sprint 2 (Tuần 2)**: `0 / 5 Tasks` (0%)
- **Sprint 3 (Tuần 3)**: `0 / 7 Tasks` (0%)
- **Sprint 4 (Tuần 4)**: `0 / 8 Tasks` (0%)
- **Tổng tiến độ toàn dự án**: `6 / 28 Tasks` (**21.4%**)

---

## 🟢 SPRINT 1: HẠ TẦNG, AUTH & CHỢ ĐẤU GIÁ CONCURRENCY

| Ngày | Bước | Nhiệm vụ chính | Trạng thái | Commit đã tạo | Ghi chú & Kết quả Test |
| :---: | :---: | :--- | :---: | :--- | :--- |
| **Ngày 1** | **Bước 1.1** | Docker Compose đa dịch vụ & Healthcheck (Postgres, Mongo, Redis) | ✅ COMPLETED | `feat(infra): setup docker-compose with postgres, mongo and redis` | 3 container Postgres, Redis, Mongo chạy healthy với volume persistence |
| **Ngày 2** | **Bước 1.2** | Thiết lập Prisma, Migration & Indexing (Optimistic Lock & Composite Indexes) | ✅ COMPLETED | `feat(db): define schema models with optimistic lock and composite indexes` | Đã khởi tạo schema, migration SQL và composite indexes thành công |
| **Ngày 3** | **Bước 1.3** | Cài đặt Multi-tenancy với `nestjs-cls` & Prisma Extension | ✅ COMPLETED | `feat(db): implement rls multi-tenancy extension via async-local-storage` | Đã cấu hình ClsService AsyncLocalStorage và Prisma RLS extension tự động lọc |
| **Ngày 4** | **Bước 1.4** | Auth Module: JWT & Refresh Token Rotation với Redis Whitelist/Blacklist | ✅ COMPLETED | `feat(auth): implement jwt auth with refresh token rotation and redis blacklist` | Đã hoàn thành AuthService, Redis token hash, Token Rotation, Reuse Detection và tích hợp Swagger |
| **Ngày 5** | **Bước 1.5** | RoleGuard & Decorator RBAC (`PLAYER`, `MODERATOR`, `ADMIN`) | ✅ COMPLETED | `feat(auth): add roles decorator, current user decorator, and rbac guard` | Đã thêm @Roles, @CurrentUser, JwtAuthGuard, RolesGuard và Swagger /auth/me, /auth/admin |
| **Ngày 6** | **Bước 1.6** | Ví tiền: Giao dịch nạp/trừ tiền an toàn với Optimistic Locking | ✅ COMPLETED | `feat(wallet): implement safe balance updates using optimistic locking` | Đã hoàn thành WalletService với version increment, atomic UPDATE WHERE, transaction chuyển tiền |
| **Ngày 7** | **Bước 1.7** | Chợ đấu giá: Idempotency Key & Redis Distributed Lock | ⏳ PENDING | `feat(auction): add idempotency guard and redis distributed lock` | |
| **Ngày 7** | **Bước 1.8** | Chợ đấu giá: Atomic Outbid Refund & Anti-Sniping Transaction | ⏳ PENDING | `feat(auction): complete atomic bid transaction with outbid refund and anti-sniping` | |

---

## 🔵 SPRINT 2: CORE GAME FSM, WEBSOCKETS & RECONNECTION

| Ngày | Bước | Nhiệm vụ chính | Trạng thái | Commit đã tạo | Ghi chú & Kết quả Test |
| :---: | :---: | :--- | :---: | :--- | :--- |
| **Ngày 8** | **Bước 2.1** | Thiết kế Pure FSM Class (Đóng gói State Pattern, Core Domain) | ⏳ PENDING | `feat(game): implement pure match finite state machine with strict guards` | |
| **Ngày 9** | **Bước 2.2** | Action Handlers & Đa hình (Polymorphism: Spawn, Spell, EndTurn) | ⏳ PENDING | `feat(game): add polymorphic action handlers for cards and spells` | |
| **Ngày 10** | **Bước 2.3** | Socket.io Gateway & Redis Adapter (Cluster scaling) | ⏳ PENDING | `feat(socket): setup game gateway with socket.io redis adapter for scaling` | |
| **Ngày 11** | **Bước 2.4** | Turn Timer 30s với BullMQ Delayed Job | ⏳ PENDING | `feat(game): implement 30s turn timer via bullmq delayed jobs` | |
| **Ngày 12** | **Bước 2.5** | Cơ chế Graceful Reconnection 60s với Redis TTL Cache | ⏳ PENDING | `feat(socket): add graceful reconnection mechanism with redis ttl cache` | |
| **Ngày 13** | **Review** | Tích hợp liên module Sprint 1 & 2 (Auth -> Room -> Match loop) | ⏳ PENDING | `chore: integrate auth and game socket lifecycle` | |
| **Ngày 14** | **Buffer** | Buffer Day & Rà soát memory leaks / connection timeouts | ⏳ PENDING | `test: verify socket connection stability` | |

---

## 🟡 SPRINT 3: MATCHMAKING QUEUE, OUTBOX PATTERN & REPLAY

| Ngày | Bước | Nhiệm vụ chính | Trạng thái | Commit đã tạo | Ghi chú & Kết quả Test |
| :---: | :---: | :--- | :---: | :--- | :--- |
| **Ngày 15** | **Bước 3.1** | Matchmaking Queue với Redis Sorted Set (ZSET) | ⏳ PENDING | `feat(matchmaking): implement elo queue using redis sorted set` | |
| **Ngày 16** | **Bước 3.2** | BullMQ Repeatable Job & Nới rộng khoảng ELO động | ⏳ PENDING | `feat(matchmaking): add repeatable job with dynamic elo expansion` | |
| **Ngày 17** | **Bước 3.3** | Lua Script ghép trận nguyên tử chống Double-Matching | ⏳ PENDING | `feat(matchmaking): ensure atomic matchmaking pairs using redis lua script` | |
| **Ngày 18** | **Bước 3.4** | Transactional Outbox Pattern: Ghi sự kiện nguyên tử | ⏳ PENDING | `feat(outbox): record match finished event atomically using outbox pattern` | |
| **Ngày 19** | **Bước 3.5** | Outbox Worker & Phân phối sự kiện (At-least-once Delivery) | ⏳ PENDING | `feat(outbox): implement resilient outbox worker with retry backoff` | |
| **Ngày 20** | **Bước 3.6** | MongoDB Event Sourcing & Deterministic Replay Engine | ⏳ PENDING | `feat(replay): store deterministic inputs and random seed in mongodb` | |
| **Ngày 21** | **Bước 3.7** | Worker Threads cho Anti-Cheat Replay Verification | ⏳ PENDING | `feat(replay): offload anti-cheat replay simulation to nodejs worker threads` | |

---

## 🟣 SPRINT 4: TESTING, TỐI ƯU HÓA & ĐO KIỂM CHỊU TẢI (K6)

| Ngày | Bước | Nhiệm vụ chính | Trạng thái | Commit đã tạo | Ghi chú & Kết quả Test |
| :---: | :---: | :--- | :---: | :--- | :--- |
| **Ngày 22** | **Bước 4.1** | Unit Test FSM & Mocking Dependencies (100% Core coverage) | ⏳ PENDING | `test(unit): add comprehensive unit test suite for game fsm` | |
| **Ngày 23** | **Bước 4.2** | Concurrency Test cho Chợ đấu giá với Jest (50 simultaneous bids) | ⏳ PENDING | `test(integration): verify auction concurrency safety under 50 simultaneous bids` | |
| **Ngày 24** | **Bước 4.3** | Kịch bản k6 Load Testing (1000 Concurrent Sockets, p95 < 50ms) | ⏳ PENDING | `test(load): add k6 stress testing script for 1000 concurrent socket users` | |
| **Ngày 25** | **Bước 4.4** | Sơ đồ kiến trúc Mermaid & Tài liệu thiết kế C4 trong README.md | ⏳ PENDING | `docs: complete readme with architectural diagrams and benchmark results` | |
| **Ngày 26** | **Frontend** | Khởi tạo React App & kết nối Dashboard / Bàn cờ chiến thuật | ⏳ PENDING | `feat(frontend): setup react arena client with websocket state listener` | |
| **Ngày 27** | **E2E** | End-to-End Testing toàn hệ thống & Production Checklist | ⏳ PENDING | `chore: production readiness polish and end-to-end verification` | |
| **Ngày 28** | **Release** | Tổng kết Sprint, Đóng gói Artifacts, Gắn Tag `v1.0.0-master` | ⏳ PENDING | `release: tag v1.0.0-master milestone` | |

---

## 📝 NHẬT KÝ THỰC HIỆN HÀNG NGÀY (DAILY LOG)

*(Ghi chú các phát sinh, giải pháp kỹ thuật và các quyết định kiến trúc tại đây)*

### [2026-09-28 -> 2026-10-02] - Hoàn thành Bước 1.1, 1.2, 1.3 & 1.4
- **Bước 1.1**: Thiết lập `docker-compose.yml` (PostgreSQL 16, Redis 7, MongoDB 7).
- **Bước 1.2**: Hoàn thành Prisma schema với các models chính (`User`, `Guild`, `Wallet`, `AuctionItem`, `Bid`, `Match`, `OutboxEvent`). Tích hợp Optimistic Locking và Composite Indexes.
- **Bước 1.3**: Hoàn thành Multi-tenancy RLS với `nestjs-cls` (AsyncLocalStorage) và Prisma Extension tự động lọc dữ liệu theo `guildId`.
- **Bước 1.4**: Xây dựng Auth Module hoàn chỉnh với Access Token (15m) + HttpOnly Cookie Refresh Token (7d). Tích hợp Redis Token Hash, cơ chế Refresh Token Rotation và Reuse Detection (chống Token Theft). Tự động tạo ví tặng 1.000 Vàng khi đăng ký mới. Tích hợp Swagger OpenAPI UI tại `/api/docs`.
