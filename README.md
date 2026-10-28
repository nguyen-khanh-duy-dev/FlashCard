# 📚 FlashCard — học từ vựng cá nhân

Web học từ vựng kiểu Quizlet, đơn giản, miễn phí: tự thêm từ, lật thẻ, luyện viết, nghe & viết và **ôn tập ngắt quãng** (SM-2).

- Frontend: React + Vite
- Backend: Supabase (Auth + Postgres)

## Cài đặt (khoảng 5 phút)

### 1. Tạo project Supabase
1. Vào https://supabase.com → **New project** (gói Free là đủ).
2. Mở **SQL Editor** → **New query**, dán toàn bộ nội dung file `supabase/schema.sql` → **Run**.
3. (Khuyên dùng) **Authentication → Sign In / Providers → Email** → tắt **Confirm email** để đăng ký xong dùng luôn, không cần xác nhận email.
4. Vào **Project Settings → API**, copy **Project URL** và khóa **anon public**.

### 2. Cấu hình & chạy
```bash
cp .env.example .env      # rồi điền URL và anon key vào .env
npm install
npm run dev
```
Mở http://localhost:5173, đăng ký tài khoản và bắt đầu tạo bộ từ.

## Tính năng

| Chế độ | Mô tả |
| --- | --- |
| 🧠 **Học & ôn tập** | Hiện từ → tự nhớ → lật → chấm *Quên / Khó / Được / Dễ*. Ứng dụng tự hẹn ngày ôn tiếp theo (10 phút, 1 ngày, 3 ngày, 1 tuần…). Thẻ "Quên" sẽ lặp lại ngay trong phiên. Phím tắt: Space, 1–4. |
| 🃏 **Thẻ ghi nhớ** | Lật thẻ, trộn, đảo mặt (hiện nghĩa trước), tự đọc phát âm. Phím tắt: Space, ← →. |
| ✍️ **Viết** | *Nghĩa → viết từ*, *Từ → viết nghĩa*, *🎧 Nghe & viết* (chính tả). Từ sai lặp lại cuối vòng; cuối bài có thể luyện lại các từ sai. |
| 🔊 **Phát âm** | Dùng giọng đọc tiếng Anh có sẵn trong trình duyệt (Chrome/Edge có giọng tốt nhất). |
| ➕ **Thêm từ** | Thêm từng từ, hoặc dán nhiều dòng `từ - nghĩa - ví dụ` (hỗ trợ ngăn cách bằng Tab, ` - `, `:`, `,` — copy từ Excel/Google Sheets dùng Tab). |

Trang chủ có nút **Ôn tập hôm nay** gom tất cả thẻ đến hạn của mọi bộ.

## Đưa lên mạng (tuỳ chọn)
`npm run build` tạo thư mục `dist/` — có thể kéo-thả lên Netlify/Vercel/Cloudflare Pages (nhớ khai báo 2 biến `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` trong phần cài đặt của dịch vụ đó). App dùng HashRouter nên không cần cấu hình rewrite.
