# 🏆 BER-ARENA - KẾ HOẠCH THỰC THI CHI TIẾT 4 TUẦN (MASTER ROADMAP)

> **Mô hình học & làm**: Micro-Tasking (< 50 dòng code / bước, hiểu bản chất 100%).  
> **Thời lượng**: 4 tuần (28 ngày, 6 ngày làm việc + 1 ngày Review/Buffer mỗi tuần).  
> **Mục tiêu**: Xây dựng hệ thống Backend Game & Real-time Auction chuẩn Enterprise chịu tải cao, concurrency-safe, event-driven.

---

## 📅 TỔNG QUAN LỊCH TRÌNH 4 TUẦN

| Tuần | Chủ đề trọng tâm | Mục tiêu chính | Công nghệ & Khái niệm cốt lõi |
| :--- | :--- | :--- | :--- |
| **Tuần 1** | **Hạ tầng, Auth & Chợ đấu giá Concurrency** | Thiết lập DB, RLS Multi-tenancy, Auth JWT Rotation, Concurrency Safe Wallet & Auction | Docker, PostgreSQL 16, Redis 7, MongoDB 7, Prisma, AsyncLocalStorage, Redlock, Optimistic Locking |
| **Tuần 2** | **Core Game FSM, WebSockets & Reconnection** | Xây dựng máy trạng thái trận đấu thuần OOP, WebSocket Gateway, Turn Timer, Graceful Reconnection | State Machine Pattern, Polymorphism, Socket.io, Redis Pub/Sub, BullMQ Delayed Jobs, Redis TTL |
| **Tuần 3** | **Matchmaking Queue, Outbox Pattern & Replay** | Ghép trận ELO động, Atomic Lua script, Transactional Outbox, Event Sourcing & Anti-cheat Worker Threads | Redis Sorted Set (ZSET), Lua Scripts, Transactional Outbox, At-least-once Delivery, Mongo Event Sourcing, Node Worker Threads |
| **Tuần 4** | **Testing, K6 Load Testing & Hoàn thiện** | Unit test FSM, Concurrency test race condition, k6 1.000 VU WebSockets, Architecture Docs | Jest, Unit/Integration Testing, Concurrency Testing, k6 Load Testing, C4 Architecture Model |

---

## 🛠️ CHI TIẾT LỊCH TRÌNH TỪNG NGÀY

---

### 🟢 TUẦN 1: HẠ TẦNG, AUTH & CHỢ ĐẤU GIÁ CONCURRENCY

#### **Ngày 1: Bước 1.1 - Khởi tạo Hạ tầng Docker Compose & Healthcheck**
- **Nhiệm vụ**:
  - Viết file `docker/docker-compose.yml` khởi chạy PostgreSQL 16, Redis 7 và MongoDB 7.
  - Cấu hình Persistent Volumes và Network Bridge chung.
  - Thiết lập lệnh `healthcheck` (`pg_isready -U postgres`, `redis-cli ping`).
- **Kiến thức & Khái niệm cần nắm**:
  - Docker Compose v2, bridge networking, volume persistence.
  - Healthcheck lifecycle: `interval`, `timeout`, `retries`, `start_period`.
  - Khác biệt giữa container restart và data persistence.
- **Output**:
  - File: `docker/docker-compose.yml`
  - Commit: `feat(infra): setup docker-compose with postgres, mongo and redis`
- **Cách verify**: `docker compose -f docker/docker-compose.yml up -d` -> chạy `docker compose ps` thấy tất cả service đều ở trạng thái `healthy`.

---

#### **Ngày 2: Bước 1.2 - Thiết kế Prisma Schema, Migration & Indexing**
- **Nhiệm vụ**:
  - Cài đặt `@prisma/client`, `prisma`. Khởi tạo `prisma/schema.prisma`.
  - Định nghĩa models: `User`, `Guild`, `Wallet`, `AuctionItem`, `Bid`, `Match`, `OutboxEvent`.
  - Bổ sung trường `version Int @default(0)` vào `Wallet` và `AuctionItem` phục vụ Optimistic Locking.
  - Đánh composite index tối ưu: `@@index([status, endTime])` trên `AuctionItem`, `@@index([status, createdAt])` trên `OutboxEvent`.
  - Chạy `npx prisma migrate dev --name init_schema`.
- **Kiến thức & Khái niệm cần nắm**:
  - Database Normalization, Foreign Keys, Indexing (B-Tree, Composite Indexes).
  - Phân tích chi phí: Index Scan vs Full Table Scan.
  - Nguyên lý Optimistic Locking thông qua trường version counter.
- **Output**:
  - File: `prisma/schema.prisma`, thư mục `prisma/migrations/`
  - Commit: `feat(db): define schema models with optimistic lock and composite indexes`
- **Cách verify**: `npx prisma studio` mở trực quan các bảng, kiểm tra khóa ngoại và indexes tạo thành công trong PostgreSQL.

---

#### **Ngày 3: Bước 1.3 - RLS Multi-tenancy với nestjs-cls & Prisma Extension**
- **Nhiệm vụ**:
  - Cài đặt `nestjs-cls` (quản lý Context / AsyncLocalStorage).
  - Tạo `src/common/middleware/guild-context.middleware.ts` bắt header `x-guild-id`.
  - Viết Prisma Client Extension `src/database/prisma.extension.ts` can thiệp `$allOperations`: tự động inject `{ where: { guildId } }` nếu model có quan hệ tenant.
  - Tạo `src/database/prisma.service.ts` tích hợp extension.
- **Kiến thức & Khái niệm cần nắm**:
  - Multi-tenancy architectures (Database-per-tenant vs Schema-per-tenant vs Row-Level Security / Shared Schema).
  - Node.js `AsyncLocalStorage`: Duy trì ngữ cảnh request mà không cần truyền biến thủ công qua từng tầng service.
  - Prisma Extensions API (`client.$extends`).
- **Output**:
  - File: `src/common/middleware/guild-context.middleware.ts`, `src/database/prisma.extension.ts`, `src/database/prisma.service.ts`
  - Commit: `feat(db): implement rls multi-tenancy extension via async-local-storage`
- **Cách verify**: Viết query thử nghiệm với `x-guild-id: guild_1`, kiểm tra query sinh ra trong SQL log có mệnh đề `WHERE guildId = 'guild_1'`.

---

#### **Ngày 4: Bước 1.4 - Auth Module: JWT & Refresh Token Rotation với Redis**
- **Nhiệm vụ**:
  - Cài đặt `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `bcrypt`, `ioredis`.
  - Cấu hình cấp phát cặp token: Access Token (15m), Refresh Token (7 ngày, HttpOnly cookie).
  - Lưu trữ hash của Refresh Token vào Redis dạng Hash Set: `HSET user_tokens:<userId> <tokenId> <tokenHash>`.
  - Cơ chế Refresh Token Rotation: mỗi lần đổi token, hủy tokenId cũ, sinh token mới.
  - Phát hiện gian lận (Reuse Detection): nếu token đã thu hồi bị tái sử dụng -> lập tức xóa toàn bộ token của user đó trong Redis.
- **Kiến thức & Khái niệm cần nắm**:
  - JWT RFC 7519, Access Token vs Refresh Token, HttpOnly Cookie chống XSS.
  - Tấn công Token Theft & giải pháp Refresh Token Rotation (RFC 6749 BCP).
  - Cấu trúc dữ liệu Redis: HSET, HDEL, DEL, EXPIRE.
- **Output**:
  - File: `src/modules/auth/auth.service.ts`, `src/modules/auth/auth.controller.ts`, `src/config/jwt.config.ts`, `src/config/redis.config.ts`
  - Commit: `feat(auth): implement jwt auth with refresh token rotation and redis blacklist`
- **Cách verify**: Dùng Postman login -> gọi endpoint `/auth/refresh` 2 lần với cùng 1 refresh token cũ -> lần 2 phải trả về 401 Unauthorized và session Redis bị dọn sạch.

---

#### **Ngày 5: Bước 1.5 - Phân quyền RBAC: RoleGuard & Decorator**
- **Nhiệm vụ**:
  - Định nghĩa Enum Role (`PLAYER`, `MODERATOR`, `ADMIN`).
  - Viết Custom Decorator `@Roles(...roles: Role[])` dùng `SetMetadata`.
  - Viết `RolesGuard` kế thừa `CanActivate`, sử dụng `Reflector` trích xuất role metadata và so sánh với `req.user.role`.
  - Viết `JwtAuthGuard` kế thừa `AuthGuard('jwt')` và cấu hình Global hoặc Controller level.
- **Kiến thức & Khái niệm cần nắm**:
  - OOP: Đóng gói (Encapsulation) & Đa hình (Polymorphism) qua interface `CanActivate`.
  - NestJS Reflection API & Decorator Pattern.
  - Nguyên tắc Least Privilege trong thiết kế phân quyền.
- **Output**:
  - File: `src/common/decorators/roles.decorator.ts`, `src/common/guards/roles.guard.ts`, `src/common/guards/jwt-auth.guard.ts`
  - Commit: `feat(auth): add roles decorator and rbac guard`
- **Cách verify**: Test endpoint chỉ định `@Roles(Role.ADMIN)` bằng user role `PLAYER` -> kỳ vọng trả về 403 Forbidden.

---

#### **Ngày 6: Bước 1.6 - Ví tiền: Giao dịch nạp/trừ an toàn với Optimistic Locking**
- **Nhiệm vụ**:
  - Xây dựng `WalletService` với phương thức trừ tiền `deductBalance` và nạp tiền `depositBalance`.
  - Sử dụng câu lệnh UPDATE có điều kiện kết hợp `version`:
    `UPDATE "Wallet" SET "goldBalance" = "goldBalance" - :amount, "version" = "version" + 1 WHERE "userId" = :userId AND "version" = :version AND "goldBalance" >= :amount`.
  - Nếu số dòng cập nhật trả về = 0 -> Ném exception `409 Conflict` (Số dư đã thay đổi hoặc không đủ tiền).
- **Kiến thức & Khái niệm cần nắm**:
  - Race Condition & Lost Update anomaly.
  - Pessimistic Locking (`SELECT FOR UPDATE`) vs Optimistic Locking (`version` column).
  - Đảm bảo tính ACID qua `prisma.$transaction`.
- **Output**:
  - File: `src/modules/wallet/wallet.service.ts`, `src/modules/wallet/wallet.controller.ts`
  - Commit: `feat(wallet): implement safe balance updates using optimistic locking`
- **Cách verify**: Viết script gọi trừ tiền đồng thời 2 lần với cùng số dư ban đầu -> chỉ 1 request thành công, request kia bắn 409 Conflict.

---

#### **Ngày 7: Bước 1.7 & 1.8 - Chợ đấu giá Concurrency, Idempotency & Outbid Safe**
- **Nhiệm vụ**:
  - Viết `IdempotencyGuard` kiểm tra header `Idempotency-Key` qua Redis: `SET idempotency:bid:<key> 1 NX EX 10`.
  - Thiết lập Redis Distributed Lock cho từng vật phẩm: `SET lock:auction:<itemId> <token> NX PX 2000`.
  - Viết hàm `placeBid` nguyên tử trong `prisma.$transaction`:
    1. Kiểm tra giá đặt mới $\ge currentBid + step$.
    2. Cập nhật `AuctionItem` với điều kiện `version = currentVersion`.
    3. Hoàn tiền vào ví người bị vượt giá (`highestBidderId` cũ).
    4. Trừ tiền người đặt mới bằng `WalletService`.
    5. Ghi lịch sử vào bảng `Bid`.
    6. Cơ chế Anti-Sniping: nếu `endTime - now < 10s` -> tự động gia hạn `endTime += 30s`.
- **Kiến thức & Khái niệm cần nắm**:
  - Idempotency Pattern (chống trùng lặp do network retry hoặc người dùng click đúp).
  - Redlock Algorithm & Distributed Lock pitfalls.
  - Atomic multi-step operations trong hệ thống tài chính/đấu giá.
- **Output**:
  - File: `src/modules/auction/guards/idempotency.guard.ts`, `src/modules/auction/auction.service.ts`, `src/modules/auction/auction.controller.ts`
  - Commit: `feat(auction): complete atomic bid transaction with outbid refund and anti-sniping`
- **Cách verify**: Đặt giá liên tục cho 1 item -> verify ví tiền của bidder cũ được hoàn đúng số xu, bidder mới bị trừ đúng số xu, thời gian kết thúc tự tăng khi còn dưới 10s.

---

### 🔵 TUẦN 2: CORE GAME FSM, WEBSOCKETS & RECONNECTION

#### **Ngày 8: Bước 2.1 - Thiết kế Pure FSM Class (Đóng gói & State Pattern)**
- **Nhiệm vụ**:
  - Tạo `src/modules/game/fsm/game-state.interface.ts` định nghĩa kiểu dữ liệu bàn cờ (Grid, Player HP, Mana, Deck, Hand, Turn).
  - Tạo `src/modules/game/fsm/match-state-machine.ts` độc lập 100% với NestJS & Socket.io (Pure TypeScript Class).
  - Đóng gói (Encapsulation): Tất cả state fields là `private`. Chỉ expose hàm `dispatch(event: GameEvent, payload?: any): StateTransitionResult`.
  - Triển khai State Flow:
    `WAITING_FOR_PLAYERS` $\rightarrow$ `DRAFTING` $\rightarrow$ `PLAYER_A_TURN` $\leftrightarrow$ `PLAYER_B_TURN` $\rightarrow$ `GAME_OVER`.
- **Kiến thức & Khái niệm cần nắm**:
  - Finite State Machine (FSM) theory: States, Transitions, Events, Guards.
  - State Pattern & OOP Encapsulation.
  - Tách biệt Core Domain Logic khỏi Framework (Clean Architecture / Hexagonal Architecture).
- **Output**:
  - File: `src/modules/game/fsm/game-state.interface.ts`, `src/modules/game/fsm/match-state-machine.ts`
  - Commit: `feat(game): implement pure match finite state machine with strict guards`
- **Cách verify**: Chạy unit test chay bằng `ts-node` thử dispatch `PLAYER_A_TURN` khi đang ở `WAITING_FOR_PLAYERS` -> phải ném lỗi invalid transition.

---

#### **Ngày 9: Bước 2.2 - Action Handlers & Đa hình (Polymorphism)**
- **Nhiệm vụ**:
  - Định nghĩa interface `ActionHandler`:
    - `validate(state: Readonly<GameState>, action: GameAction): boolean`
    - `execute(state: GameState, action: GameAction): ActionResult`
  - Tạo các class xử lý riêng biệt:
    - `SpawnUnitHandler`: Kiểm tra mana, vị trí ô trống trên grid, trừ mana, đặt lính.
    - `CastSpellHandler`: Kiểm tra tầm ảnh hưởng, tính sát thương/hiệu ứng.
    - `EndTurnHandler`: Reset mana, rút bài mới, chuyển lượt sang đối thủ.
  - Tạo `ActionRegistry` để lookup handler dựa trên `action.type` (không dùng `switch-case` lồng nhau).
- **Kiến thức & Khái niệm cần nắm**:
  - OOP: Tính Đa hình (Polymorphism) & Interface Segregation Principle (SOLID).
  - Strategy Pattern / Command Pattern kết hợp Registry.
  - Immutability vs Mutation an toàn trong game loop.
- **Output**:
  - File: `src/modules/game/handlers/action-handler.interface.ts`, `src/modules/game/handlers/spawn-unit.handler.ts`, `src/modules/game/handlers/cast-spell.handler.ts`, `src/modules/game/handlers/action-registry.ts`
  - Commit: `feat(game): add polymorphic action handlers for cards and spells`
- **Cách verify**: Dispatch hành động `SPAWN_UNIT` khi không đủ mana -> `validate()` trả về false và ném lỗi rõ ràng.

---

#### **Ngày 10: Bước 2.3 - Socket.io Gateway & Redis Adapter**
- **Nhiệm vụ**:
  - Cài đặt `@nestjs/websockets`, `@nestjs/platform-socket.io`, `socket.io`, `@socket.io/redis-adapter`.
  - Cấu hình Redis Adapter cho Socket.io để hỗ trợ multi-instance scaling.
  - Viết `WsAuthGuard` xác thực JWT từ `client.handshake.auth.token` ngay khi kết nối.
  - Viết `GameGateway`:
    - Event `@SubscribeMessage('join_match')`: cho client vào room `match_<id>`.
    - Event `@SubscribeMessage('game_action')`: route action vào FSM và broadcast state cập nhật cho cả room: `server.to("match_" + matchId).emit("state_update", updatedState)`.
- **Kiến thức & Khái niệm cần nắm**:
  - WebSocket Protocol RFC 6455, Socket.io Handshake, Rooms & Namespaces.
  - Socket.io Redis Adapter: Đồng bộ hóa broadcast giữa nhiều server Node.js qua Redis Pub/Sub.
  - WS Authentication & Guard lifecycle trong NestJS.
- **Output**:
  - File: `src/modules/game/gateways/game.gateway.ts`, `src/modules/game/gateways/ws-auth.guard.ts`, `src/modules/game/gateways/redis-io.adapter.ts`
  - Commit: `feat(socket): setup game gateway with socket.io redis adapter for scaling`
- **Cách verify**: Dùng Postman hoặc Socket Client kết nối có kèm JWT token hợp lệ -> nhận thông báo join phòng thành công; kết nối không token bị ngắt ngay lập tức.

---

#### **Ngày 11: Bước 2.4 - Turn Timer với BullMQ Delayed Job**
- **Nhiệm vụ**:
  - Cài đặt `bullmq` và `@nestjs/bullmq`.
  - Thiết lập hàng đợi `turn-timer` kết nối Redis.
  - Khi bắt đầu mỗi lượt: Thêm BullMQ job với `{ delay: 30000, jobId: `turn_${matchId}_${turnNumber}` }`.
  - Nếu người chơi thực hiện xong hành động kết thúc lượt trước 30s: Hủy job đang chờ `await queue.remove(jobId)`.
  - Tạo `TurnTimerProcessor`: Khi job kích hoạt sau 30s không bị hủy -> dispatch sự kiện `TIMEOUT` vào FSM, tự động bỏ lượt và broadcast cho 2 người chơi.
- **Kiến thức & Khái niệm cần nắm**:
  - Message Queue vs Task Scheduling, Delayed Jobs trong Redis.
  - BullMQ internals: Streams, Delayed Sets, Redis Keyspace Notifications.
  - Idempotency trong xử lý timeout để tránh xung đột lượt kế tiếp.
- **Output**:
  - File: `src/modules/game/queues/turn-timer.queue.ts`, `src/modules/game/queues/turn-timer.processor.ts`
  - Commit: `feat(game): implement 30s turn timer via bullmq delayed jobs`
- **Cách verify**: Vào phòng chơi, không thao tác gì -> sau đúng 30s nhận được event socket `turn_timeout` và lượt chuyển sang Player 2.

---

#### **Ngày 12: Bước 2.5 - Graceful Reconnection với Redis TTL**
- **Nhiệm vụ**:
  - Viết `ReconnectService`:
    - Khi socket disconnect: Không hủy trận ngay. Ghi `HSET offline_session:<userId>` kèm `EX 60` vào Redis.
    - Tạo BullMQ Delayed Job hẹn giờ sau 60s: nếu key `offline_session:<userId>` vẫn tồn tại -> xử thua do bỏ cuộc (`SURRENDER`).
    - Khi client kết nối lại với `reconnectToken`: Kiểm tra Redis session -> hủy Delayed Job 60s -> join socket mới vào room cũ -> gửi toàn bộ `full_state` hiện tại để client render lại.
- **Kiến thức & Khái niệm cần nắm**:
  - Network Flakiness & Transient Failure Handling trong Multiplayer Games.
  - Session Preservation via Distributed In-Memory Cache.
  - State Synchronization: Delta Update vs Full State Snapshot.
- **Output**:
  - File: `src/modules/game/services/reconnect.service.ts`
  - Commit: `feat(socket): add graceful reconnection mechanism with redis ttl cache`
- **Cách verify**: Giả lập ngắt mạng client 15 giây rồi reconnect -> client nhận lại trạng thái bàn cờ hiện tại và trận đấu tiếp tục bình thường; nếu ngắt quá 60s -> trận kết thúc với kết quả bị xử thua.

---

#### **Ngày 13 & 14: Review Tuần 2 & Tích hợp liên module Sprint 1 & 2**
- **Nhiệm vụ**:
  - Nối luồng: Đăng nhập -> Lấy token -> Tham gia đấu giá / Vào phòng game -> Đếm timer lượt -> Reconnect khi mất mạng.
  - Viết unit test sơ bộ cho các Action Handler (`SpawnUnitHandler`, `CastSpellHandler`).
  - Dọn dẹp code, rà soát memory leaks trên Redis và Socket connections.

---

### 🟡 TUẦN 3: MATCHMAKING QUEUE, OUTBOX PATTERN & REPLAY

#### **Ngày 15: Bước 3.1 - Matchmaking Queue với Redis Sorted Set (ZSET)**
- **Nhiệm vụ**:
  - Xây dựng `MatchmakingService`:
    - Endpoint `POST /matchmaking/join`: Thêm user vào Redis ZSET `ZADD matchmaking_queue <user_elo> <userId>`.
    - Lưu metadata thời gian tham gia: `HSET matchmaking_wait_time <userId> <timestamp>`.
    - Endpoint `POST /matchmaking/leave`: Xóa khỏi queue (`ZREM`).
- **Kiến thức & Khái niệm cần nắm**:
  - Redis Data Structures: Sorted Sets (ZSET) với cấu trúc Skip List nội bộ.
  - Độ phức tạp thời gian: $O(\log N)$ khi chèn và truy vấn theo score (ELO).
  - Thuật toán ghép trận dựa trên xếp hạng ELO.
- **Output**:
  - File: `src/modules/matchmaking/matchmaking.service.ts`, `src/modules/matchmaking/matchmaking.controller.ts`
  - Commit: `feat(matchmaking): implement elo queue using redis sorted set`
- **Cách verify**: Cho 5 user join queue với các mức ELO khác nhau (1000, 1050, 1200, 1500) -> kiểm tra bằng Redis CLI `ZRANGE matchmaking_queue 0 -1 WITHSCORES`.

---

#### **Ngày 16: Bước 3.2 - Dynamic ELO Expansion với BullMQ Repeatable Job**
- **Nhiệm vụ**:
  - Tạo `MatchmakingProcessor` chạy Repeatable Job mỗi 1.000ms (`every: 1000`).
  - Duyệt danh sách người chơi trong `matchmaking_queue`.
  - Tính thời gian chờ: $\Delta t = \text{now} - \text{joinedAt}$ (tính bằng giây).
  - Tính khoảng ELO nới rộng động:
    $[\text{ELO} - 50 - (\Delta t \times 5), \text{ELO} + 50 + (\Delta t \times 5)]$.
  - Tìm ứng viên phù hợp bằng lệnh `ZRANGEBYSCORE matchmaking_queue <minElo> <maxElo>`.
- **Kiến thức & Khái niệm cần nắm**:
  - Polling vs Event-driven trong matchmaking.
  - Trade-off giữa Match Quality (chất lượng trận đấu - cân bằng trình độ) và Match Latency (thời gian chờ).
  - Đảm bảo hiệu năng worker khi hàng đợi có hàng nghìn user.
- **Output**:
  - File: `src/modules/matchmaking/matchmaking.processor.ts`
  - Commit: `feat(matchmaking): add repeatable job with dynamic elo expansion`
- **Cách verify**: Đưa 2 user chênh nhau 200 ELO vào hàng đợi -> kiểm tra sau ~20 giây khi khoảng ELO nới rộng ra thì worker tìm thấy cặp này.

---

#### **Ngày 17: Bước 3.3 - Atomic Match Pairing với Redis Lua Script**
- **Nhiệm vụ**:
  - Tạo file `src/modules/matchmaking/scripts/match-pair.lua`.
  - Viết Lua script nguyên tử:
    - Nhận vào `player1Id`, `player2Id`.
    - Kiểm tra cả 2 người chơi có còn đang tồn tại trong `matchmaking_queue` không (`ZSCORE`).
    - Nếu cả hai hợp lệ: Gọi `ZREM matchmaking_queue p1 p2`, `HDEL matchmaking_wait_time p1 p2`, và trả về 1.
    - Nếu 1 trong 2 đã rời hàng đợi hoặc bị ghép bởi worker khác: Trả về 0 và hủy ghép.
  - Đăng ký script trong NestJS qua `ioredis.defineCommand`.
- **Kiến thức & Khái niệm cần nắm**:
  - Atomicity trong Redis với Lua Scripts (Single-threaded execution guarantees no race conditions).
  - Phòng chống Double Matching (2 worker cùng nhặt 1 player cho 2 trận khác nhau).
  - Tối ưu hóa hiệu năng với `EVALSHA`.
- **Output**:
  - File: `src/modules/matchmaking/scripts/match-pair.lua`, `src/modules/matchmaking/matchmaking.service.ts`
  - Commit: `feat(matchmaking): ensure atomic matchmaking pairs using redis lua script`
- **Cách verify**: Chạy mô phỏng 2 tiến trình worker cùng cố ghép Player 1 -> chỉ có duy nhất 1 worker nhận được kết quả thành công (1), worker còn lại nhận (0).

---

#### **Ngày 18: Bước 3.4 - Transactional Outbox Pattern: Ghi sự kiện nguyên tử**
- **Nhiệm vụ**:
  - Tạo `OutboxService`.
  - Khi trận đấu kết thúc, thực thi `prisma.$transaction`:
    1. Cập nhật bảng `Match`: `status = 'FINISHED'`, `winnerId = ...`.
    2. Ghi bản ghi vào bảng `OutboxEvent`:
       `aggregateType = 'MATCH'`, `aggregateId = matchId`, `eventType = 'MATCH_FINISHED'`,
       `payload = { matchId, winnerId, loserId, eloDelta: 25, rewardGold: 50 }`, `status = 'PENDING'`.
- **Kiến thức & Khái niệm cần nắm**:
  - Dual-Write Problem trong Distributed Systems (Lỗi khi DB ghi thành công nhưng Message Broker chết hoặc ngược lại).
  - Transactional Outbox Pattern: Đảm bảo tính nhất quán giữa Database State và Event Notification.
  - Event payload serialization & Schema versioning.
- **Output**:
  - File: `src/modules/outbox/outbox.service.ts`
  - Commit: `feat(outbox): record match finished event atomically using outbox pattern`
- **Cách verify**: Kết thúc 1 trận đấu -> kiểm tra trong PostgreSQL đồng thời xuất hiện record `FINISHED` ở `Match` và record `PENDING` ở `OutboxEvent`.

---

#### **Ngày 19: Bước 3.5 - Outbox Worker & Phân phối sự kiện (At-least-once Delivery)**
- **Nhiệm vụ**:
  - Tạo `OutboxProcessor` (BullMQ Repeatable Job hoặc polling cron):
    - Quét bảng `OutboxEvent` theo composite index `[status, createdAt]` với `status = 'PENDING'`, limit batch 50.
    - Phát sự kiện lên Redis Pub/Sub channel `event_bus`.
    - Đón nhận bởi các service xử lý độc lập:
      - `WalletService`: Cộng vàng thưởng cho người thắng.
      - `UserService`: Cập nhật ELO cho 2 người chơi.
    - Khi các consumer xử lý thành công -> Đánh dấu event là `PUBLISHED`.
    - Nếu thất bại: Tăng `retryCount`, áp dụng Exponential Backoff.
- **Kiến thức & Khái niệm cần nắm**:
  - At-least-once Delivery semantics & Consumer Idempotency.
  - Exponential Backoff & Dead Letter Queue (DLQ).
  - Polling Publisher vs Transaction Log Tailing (Debezium/CDC).
- **Output**:
  - File: `src/modules/outbox/outbox.processor.ts`
  - Commit: `feat(outbox): implement resilient outbox worker with retry backoff`
- **Cách verify**: Giả lập tắt mạng consumer -> event giữ trạng thái PENDING và retry; bật lại consumer -> event chuyển sang PUBLISHED và ví tiền user được cộng chính xác.

---

#### **Ngày 20: Bước 3.6 - MongoDB Event Sourcing & Deterministic Replay Engine**
- **Nhiệm vụ**:
  - Cài đặt `@nestjs/mongoose`, `mongoose`.
  - Tạo Schema `MatchReplay` trên MongoDB:
    - `matchId`, `randomSeed`, `startTime`, `endTime`, `winnerId`.
    - Mảng `inputs`: `[{ tick: number, playerId: string, actionType: string, payload: any }]`.
  - Trong quá trình chơi: Mỗi hành động hợp lệ được ghi lại theo thứ tự tick và lưu vào MongoDB khi hết trận.
- **Kiến thức & Khái niệm cần nắm**:
  - Event Sourcing vs State Storage: Tiết kiệm hàng chục lần dung lượng so với lưu video hoặc lưu state từng frame.
  - Deterministic Game Simulation: Cùng một `randomSeed` và cùng chuỗi `inputs` thì kết quả đầu ra luôn luôn giống hệt nhau 100%.
  - NoSQL Document Model cho cấu trúc dữ liệu chuỗi sự kiện.
- **Output**:
  - File: `src/modules/replay/schemas/match-replay.schema.ts`, `src/modules/replay/replay.service.ts`, `src/database/mongo.module.ts`
  - Commit: `feat(replay): store deterministic inputs and random seed in mongodb`
- **Cách verify**: Kết thúc trận -> truy vấn MongoDB collection `match_replays` thấy đầy đủ `randomSeed` và danh sách mảng `inputs`.

---

#### **Ngày 21: Bước 3.7 - Anti-Cheat Verification với Node.js Worker Threads**
- **Nhiệm vụ**:
  - Viết Worker file `src/modules/replay/workers/replay.worker.ts`:
    - Khởi tạo instance FSM với `randomSeed`.
    - Chạy lại tuần tự toàn bộ mảng `inputs`.
    - Trả về `calculatedWinnerId`.
  - Tạo `ReplayVerifierService`:
    - Nhận yêu cầu verify -> Spawn `Worker` từ `node:worker_threads`.
    - So sánh `calculatedWinnerId` của Worker với `winnerId` lưu trong DB.
    - Nếu phát hiện không khớp (dấu hiệu can thiệp gói tin/hack client) -> Ghi cờ `isCheating: true` và cảnh báo Admin.
- **Kiến thức & Khái niệm cần nắm**:
  - Node.js Event Loop & CPU-bound vs I/O-bound tasks.
  - Multi-threading trong Node.js qua `worker_threads` (MessagePort, SharedArrayBuffer).
  - Server-side Replay Verification chống gian lận trong game thi đấu.
- **Output**:
  - File: `src/modules/replay/workers/replay.worker.ts`, `src/modules/replay/replay-verifier.service.ts`
  - Commit: `feat(replay): offload anti-cheat replay simulation to nodejs worker threads`
- **Cách verify**: Gửi một file replay cố tình sửa `winnerId` khác với kết quả FSM tính toán -> hệ thống cảnh báo cờ gian lận mà không làm giật lag HTTP response của server chính.

---

### 🟣 TUẦN 4: TESTING, TỐI ƯU HÓA & ĐO KIỂM CHỊU TẢI (K6)

#### **Ngày 22: Bước 4.1 - Unit Testing Core FSM với 100% Code Coverage**
- **Nhiệm vụ**:
  - Viết bộ test `test/unit/match-state-machine.spec.ts` bằng Jest.
  - Thiết lập Test Cases toàn diện:
    1. Player A không thể đánh bài khi đang là lượt của Player B (kỳ vọng ném lỗi 422 Unprocessable Entity).
    2. Lính chạm đáy sân đối phương gây đúng 4 sát thương vào máu đối thủ.
    3. Khi HP của một bên giảm về $\le 0$, FSM tự động kích hoạt chuyển trạng thái sang `GAME_OVER`.
    4. Không thể dispatch bất kỳ action nào sau khi trận đấu đã `GAME_OVER`.
- **Kiến thức & Khái niệm cần nắm**:
  - Test Pyramid, TDD, First Principles trong testing State Machines.
  - Mocking, Assertion, Boundary Value Analysis.
  - Code Coverage (Branch coverage, Statement coverage).
- **Output**:
  - File: `test/unit/match-state-machine.spec.ts`
  - Commit: `test(unit): add comprehensive unit test suite for game fsm`
- **Cách verify**: Chạy `npm run test -- test/unit/match-state-machine.spec.ts` -> Tất cả tests PASS với 100% coverage của module FSM.

---

#### **Ngày 23: Bước 4.2 - Concurrency Test cho Chợ đấu giá với Jest**
- **Nhiệm vụ**:
  - Viết test tích hợp `test/integration/auction-concurrency.spec.ts`.
  - Khởi tạo 1 vật phẩm đấu giá và 10 tài khoản ví tiền có sẵn 1000 vàng.
  - Sử dụng `Promise.all()` gửi đồng thời 50 request `POST /auctions/:id/bid` với các mức giá tăng dần trong cùng 1 mili-giây.
  - Assertions bắt buộc:
    1. Chỉ có đúng 1 request giá cao nhất hợp lệ được chấp nhận.
    2. Các request bị tranh chấp đồng thời nhận `409 Conflict`.
    3. Tổng số dư ví tiền của tất cả các tài khoản cộng với tiền giữ trong phiên đấu giá phải bằng chính xác 100% tổng số tiền ban đầu (Không thất thoát dù chỉ 1 xu).
- **Kiến thức & Khái niệm cần nắm**:
  - Testing Race Conditions & Concurrency Hazards.
  - Conservation of Money Invariant (Bảo toàn tiền tệ hệ thống).
  - Jest Asynchronous Testing với High Parallelism.
- **Output**:
  - File: `test/integration/auction-concurrency.spec.ts`
  - Commit: `test(integration): verify auction concurrency safety under 50 simultaneous bids`
- **Cách verify**: Chạy `npm run test:e2e -- test/integration/auction-concurrency.spec.ts` -> Kiểm tra không xảy ra Deadlock và số dư tài chính khớp từng cent.

---

#### **Ngày 24: Bước 4.3 - Kịch bản k6 Load Testing (1000 Concurrent Socket Users)**
- **Nhiệm vụ**:
  - Viết script `test/k6/socket-load-test.js` đo kiểm hiệu năng chịu tải WebSockets.
  - Thiết lập kịch bản tải:
    - Ramp-up lên 1.000 Virtual Users (VU) trong 60s.
    - Duy trì 1.000 kết nối đồng thời gửi nhận tin nhắn state trong 5 phút.
    - Ramp-down về 0 trong 30s.
  - Ngưỡng đánh giá (Thresholds):
    - Connection error rate: $< 0.1\%$.
    - WebSocket Message Latency: $p95 < 50\text{ms}$, $p99 < 100\text{ms}$.
- **Kiến thức & Khái niệm cần nắm**:
  - Performance Testing: Stress Test, Soak Test, Spike Test.
  - Các chỉ số độ trễ phân vị: Median (p50), p95, p99.
  - Tuning hệ điều hành & Node.js cho kết nối đồng thời: `ulimit`, `TCP keepalive`, memory per socket.
- **Output**:
  - File: `test/k6/socket-load-test.js`
  - Commit: `test(load): add k6 stress testing script for 1000 concurrent socket users`
- **Cách verify**: Chạy lệnh `k6 run test/k6/socket-load-test.js` -> Console hiển thị bảng kết quả xanh đạt các chỉ số $p95 < 50\text{ms}$, không có drop connection.

---

#### **Ngày 25: Bước 4.4 - Sơ đồ kiến trúc Mermaid & Tài liệu thiết kế C4**
- **Nhiệm vụ**:
  - Cập nhật file `README.md` chính của dự án.
  - Vẽ sơ đồ Mermaid chi tiết:
    - Sơ đồ Container C4 Model: NestJS, Redis Adapter, PostgreSQL, MongoDB, BullMQ Worker.
    - Sơ đồ luồng State Machine trận đấu (FSM State Diagram).
    - Sequence Diagram luồng đấu giá đồng thời với Optimistic Lock & Redlock.
    - Sequence Diagram luồng Outbox Pattern đảm bảo At-least-once.
  - Bảng tổng hợp Trade-offs kỹ thuật:
    - Optimistic vs Pessimistic Locking trong bối cảnh chợ game.
    - Redis ZSET vs Relational DB cho matchmaking ELO.
  - Hướng dẫn One-command setup: `docker compose up --build`.
- **Kiến thức & Khái niệm cần nắm**:
  - C4 Architecture Model (Context, Container, Component, Code).
  - Kỹ năng tài liệu hóa kỹ thuật chuẩn Enterprise (Software Architecture Documentation).
  - Tư duy Trade-off & Technical Decision Records (ADR).
- **Output**:
  - File: `README.md`
  - Commit: `docs: complete readme with architectural diagrams and benchmark results`
- **Cách verify**: Preview Markdown trên GitHub hiển thị sơ đồ Mermaid đẹp mắt, cú pháp chuẩn xác.

---

#### **Ngày 26: Khởi tạo & Kết nối Frontend Demo**
- **Nhiệm vụ**:
  - Khởi tạo React TypeScript Vite app trong `frontend/` (sửa lỗi cú pháp `create-vite@latest`).
  - Cài đặt `socket.io-client`, TailwindCSS / Vanilla CSS hiện đại, thiết lập giao diện Arena Dashboard:
    - Màn hình Auth & hiển thị Ví tiền realtime.
    - Màn hình Chợ đấu giá với đồng hồ đếm ngược và nút Bid.
    - Màn hình Bàn cờ chiến thuật Game với ô lưới 8x5 và các nút hành động (Spawn Unit, Cast Spell, End Turn).
- **Kiến thức & Khái niệm cần nắm**:
  - React State Synchronization với WebSockets.
  - Optimistic UI updates vs Server-authoritative confirmation.
  - Modern Game UI/UX.
- **Output**:
  - Code trong `frontend/`
  - Commit: `feat(frontend): setup react arena client with websocket state listener`

---

#### **Ngày 27: End-to-End Testing & Tinh chỉnh Production Checklist**
- **Nhiệm vụ**:
  - Chạy toàn bộ hệ thống từ Docker Compose: Backend + Frontend + PostgreSQL + Redis + MongoDB.
  - Thực hiện kịch bản trọn vẹn: 2 người dùng đăng ký -> nạp tiền ví -> tham gia đấu giá -> vào hàng đợi ghép trận ELO -> chơi 1 trận đấu -> 1 bên disconnect -> reconnect thành công -> kết thúc trận -> outbox cộng thưởng ELO & vàng -> replay verification chạy ngầm.
  - Kiểm tra log, rà soát memory consumption và database connections.
- **Output**:
  - Commit: `chore: production readiness polish and end-to-end verification`

---

#### **Ngày 28: Tổng kết Sprint & Bàn giao Artifacts**
- **Nhiệm vụ**:
  - Đóng gói toàn bộ tài liệu kỹ thuật, cập nhật bảng tiến độ `docs/PROGRESS_TRACKER.md`.
  - Tạo tag phiên bản Git `v1.0.0-master`.
  - Đúc kết bài học về Concurrency, Event-driven và High-throughput Game Architecture.

---

## 💡 NGUYÊN TẮC LÀM VIỆC TỪNG BƯỚC VỚI AI (MICRO-TASKING)

1. **Một việc tại một thời điểm**: Chọn đúng 1 task (ví dụ: Ngày 1 - Bước 1.1). Không làm gộp nhiều bước cùng lúc.
2. **Hiểu rõ bản chất 100%**: Với mỗi file code tạo ra, yêu cầu AI giải thích tường tận tại sao lại chọn giải pháp đó, điểm mạnh và điểm yếu là gì.
3. **Tự tay kiểm thử (Verify)**: Luôn chạy lệnh kiểm tra thực tế (Docker status, Prisma Studio, Jest, Postman, k6) trước khi commit.
4. **Git Commit chuẩn Convention**: Mỗi ngày hoàn thành một nhiệm vụ, tạo commit với đúng thông điệp đã định nghĩa trong kế hoạch.
