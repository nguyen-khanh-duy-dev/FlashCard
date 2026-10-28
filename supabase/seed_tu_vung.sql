-- Nhập từ vựng trong thư mục "Từ vựng" (T1–T4.pdf), mỗi file = một bộ thẻ.
-- Chạy trong Supabase Dashboard → SQL Editor → New query → Run.
-- Chạy lại nhiều lần cũng không bị trùng: bộ nào đã có (cùng tên) thì bỏ qua.

do $$
declare
  -- Điền email tài khoản nếu project có nhiều hơn một user, ví dụ: 'ban@gmail.com'
  v_email text := null;
  v_uid   uuid;
  v_deck  uuid;
  v_cnt   int;
begin
  if v_email is not null then
    select id into v_uid from auth.users where email = v_email;
  else
    select count(*) into v_cnt from auth.users;
    if v_cnt <> 1 then
      raise exception 'Có % user — hãy điền v_email ở đầu script', v_cnt;
    end if;
    select id into v_uid from auth.users;
  end if;
  if v_uid is null then
    raise exception 'Không tìm thấy user với email %', v_email;
  end if;

  -- ===== T1.pdf =====
  if not exists (select 1 from public.decks where user_id = v_uid and name = 'PT_L_01') then
    insert into public.decks (user_id, name, description)
    values (v_uid, 'PT_L_01', 'Từ vựng T1.pdf') returning id into v_deck;

    insert into public.cards (user_id, deck_id, term, definition, example, created_at)
    select v_uid, v_deck, t.term, t.def, t.ipa, now() + t.n * interval '1 millisecond'
    from (values
      (1,  'professor',            'giáo sư',                                             '/prəˈfesə(r)/'),
      (2,  'audience',             'khán giả',                                            '/ˈɔːdiəns/'),
      (3,  'lecture hall',         'giảng đường',                                         '/ˈlektʃə(r) hɔːl/'),
      (4,  'hallway',              'hành lang',                                           '/ˈhɔːlweɪ/'),
      (5,  'face each other',      'đối diện nhau',                                       '/feɪs iːtʃ ˈʌðər/'),
      (6,  'lean',                 'ngả (ngả người vào tường, ngả người lên bàn)',        '/liːn/'),
      (7,  'several',              'một vài',                                             '/ˈsevrəl/'),
      (8,  'passenger',            'hành khách',                                          '/ˈpæsɪndʒə(r)/'),
      (9,  'venue',                'địa điểm (diễn ra sự kiện)',                          '/ˈvenjuː/'),
      (10, 'statue',               'bức tượng',                                           '/ˈstætʃuː/'),
      (11, 'gesture',              'dùng cử chỉ (sử dụng tay, cơ thể di chuyển khi nói)', '/ˈdʒestʃə(r)/'),
      (12, 'emphasize',            'nhấn mạnh',                                           '/ˈemfəsaɪz/'),
      (13, 'stroll',               'đi dạo',                                              '/strəʊl/'),
      (14, 'experience',           'trải nghiệm (một thứ gì đó)',                         '/ɪkˈspɪəriəns/'),
      (15, 'enjoyable',            'thú vị, thích thú',                                   '/ɪnˈdʒɔɪəbl/'),
      (16, 'path',                 'con đường',                                           '/pɑːθ/'),
      (17, 'point to',             'chỉ về phía ...',                                     '/pɔɪnt tu/'),
      (18, 'get on a bus',         'lên xe buýt',                                         '/ɡɛt ɑn ə bʌs/'),
      (19, 'play an instrument',   'chơi nhạc cụ',                                        '/pleɪ ən ˈɪnstrəmənt/'),
      (20, 'have a conversation',  'trò chuyện',                                          '/hæv ə ˌkɑnvərˈseɪʃən/'),
      (21, 'clap to the music',    'vỗ tay theo nhạc',                                    '/klæp tu ðə ˈmjuzɪk/'),
      (22, 'water the plants',     'tưới cây cảnh',                                       '/ˈwɔtər ðə plænts/'),
      (23, 'serve refreshments',   'phục vụ đồ ăn, đồ uống nhẹ',                          '/sɜːv rɪˈfreʃmənts/'),
      (24, 'pick up',              'nhặt cái gì đó lên',                                  '/pɪk ʌp/')
    ) as t(n, term, def, ipa);
  end if;

  -- ===== T2.pdf =====
  if not exists (select 1 from public.decks where user_id = v_uid and name = 'PT_L_02') then
    insert into public.decks (user_id, name, description)
    values (v_uid, 'PT_L_02', 'Từ vựng T2.pdf') returning id into v_deck;

    insert into public.cards (user_id, deck_id, term, definition, created_at)
    select v_uid, v_deck, t.term, t.def, now() + t.n * interval '1 millisecond'
    from (values
      (1,  'statue',             'tượng'),
      (2,  'cloudy',             'có mây'),
      (3,  'clear sky',          'bầu trời trong, không có mây'),
      (4,  'mechanic',           'người thợ máy'),
      (5,  'pile up',            'xếp chồng lên nhau'),
      (6,  'hang',               'treo (trên tường)'),
      (7,  'repair',             'sửa chữa'),
      (8,  'place',              'đặt (một đồ vật lên đâu đó)'),
      (9,  'goods',              'hàng hoá'),
      (10, 'warehouse',          'nhà kho'),
      (11, 'empty',              '(động từ) làm trống rỗng (cái gì đó)'),
      (12, 'bin',                'thùng rác'),
      (13, 'overlook',           'nhìn ra, có hướng nhìn ra phía (bờ sông, ...)'),
      (14, 'mud',                'bùn đất'),
      (15, 'arrange',            'sắp xếp (đồ vật)'),
      (16, 'transport',          'vận chuyển'),
      (17, 'ground',             'mặt đất'),
      (18, 'closet',             'tủ quần áo'),
      (19, 'bicyclist',          'người đi xe đạp'),
      (20, 'sign',               'biển báo, biển chỉ dẫn'),
      (21, 'field',              'cánh đồng'),
      (22, 'under construction', 'đang trong quá trình xây dựng'),
      (23, 'artworks',           'các tác phẩm nghệ thuật'),
      (24, 'surround',           'bao quanh'),
      (25, 'rug',                'thảm trải sàn'),
      (26, 'gather',             'tụ tập'),
      (27, 'vehicle',            'phương tiện đi lại'),
      (28, 'empty',              '(tính từ) trống rỗng, không có gì bên trong'),
      (29, 'cabinet',            'tủ có cánh và ngăn'),
      (30, 'fishing rod',        'cần câu cá'),
      (31, 'bucket',             'cái xô'),
      (32, 'attach',             'gắn vật gì đó vào đâu đó'),
      (33, 'scattered',          'nằm rải rác (trên sàn nhà)'),
      (34, 'display',            'trưng bày'),
      (35, 'story',              'tầng nhà (= floor)'),
      (36, 'roof',               'mái nhà'),
      (37, 'traffic',            'giao thông'),
      (38, 'tow',                'kéo đi (dùng khi thấy 1 phương tiện kéo phương tiện khác đi)'),
      (39, 'ladder',             'cái thang'),
      (40, 'laundry',            'đồ giặt (quần áo cần giặt)'),
      (41, 'stream',             'con suối, dòng nước'),
      (42, 'lawn',               'bãi cỏ')
    ) as t(n, term, def);
  end if;

  -- ===== T3.pdf =====
  if not exists (select 1 from public.decks where user_id = v_uid and name = 'PT_L_03') then
    insert into public.decks (user_id, name, description)
    values (v_uid, 'PT_L_03', 'Từ vựng T3.pdf') returning id into v_deck;

    insert into public.cards (user_id, deck_id, term, definition, created_at)
    select v_uid, v_deck, t.term, t.def, now() + t.n * interval '1 millisecond'
    from (values
      (1,  'production engineer', 'kỹ sư sản xuất'),
      (2,  'sales manager',       'người quản lý bán hàng'),
      (3,  'sales assistant',     'trợ lý bán hàng'),
      (4,  'digital designer',    'nhà thiết kế mỹ thuật số'),
      (5,  'admin assistant',     'trợ lý hành chính'),
      (6,  'finance officer',     'nhân viên tài chính'),
      (7,  'project manager',     'người quản lý dự án'),
      (8,  'IT specialist',       'chuyên gia CNTT'),
      (9,  'do research',         'làm nghiên cứu'),
      (10, 'call customers',      'gọi điện cho khách hàng'),
      (11, 'go to meetings',      'đi họp'),
      (12, 'travel for work',     'đi công tác'),
      (13, 'analyze data',        'phân tích số liệu'),
      (14, 'write reports',       'viết báo cáo'),
      (15, 'make calls',          'thực hiện cuộc gọi'),
      (16, 'finish work',         'làm xong việc, tan làm'),
      (17, 'start work',          'bắt đầu làm việc'),
      (18, 'answer the phone',    'trả lời điện thoại'),
      (19, 'process orders',      'xử lý các đơn đặt hàng'),
      (20, 'work from home',      'làm việc từ xa tại nhà'),
      (21, 'boil',                'sôi (nước sôi lên)'),
      (22, 'rise',                'mọc (mặt trời mọc ở ....)'),
      (23, 'one hundred',         'số một trăm'),
      (24, 'be responsible for',  'chịu trách nhiệm, có trách nhiệm với (ai đó, nhiệm vụ)'),
      (25, 'clients',             'các khách hàng'),
      (26, 'take notes',          'ghi chép'),
      (27, 'rarely',              'ít khi, hiếm khi'),
      (28, 'look at the screen',  'nhìn màn chiếu'),
      (29, 'shelf',               'kệ (sách, hàng)'),
      (30, 'put on',              'mặc vào'),
      (31, 'monitor',             'màn hình (máy tính)'),
      (32, 'headset',             'tai nghe chùm đầu (có gắn cả mic)'),
      (33, 'notepad',             'sổ tay ghi chép'),
      (34, 'reach for',           'với tới để lấy (vật gì đó)'),
      (35, 'clipboard',           'tấm bảng nhỏ có thể kẹp giấy, viết cho chắc chắn'),
      (36, 'shake hands',         'bắt tay'),
      (37, 'assembly line',       'dây chuyền lắp ráp'),
      (38, 'lift',                'nâng (vật gì đó lên)'),
      (39, 'luggage',             'hành lý'),
      (40, 'blueprint',           'bản thiết kế'),
      (41, 'take inventory',      'kiểm kê, kiểm kho'),
      (42, 'dishes',              'bát đĩa')
    ) as t(n, term, def);
  end if;

  -- ===== T4.pdf =====
  if not exists (select 1 from public.decks where user_id = v_uid and name = 'PT_L_04') then
    insert into public.decks (user_id, name, description)
    values (v_uid, 'PT_L_04', 'Từ vựng T4.pdf') returning id into v_deck;

    insert into public.cards (user_id, deck_id, term, definition, created_at)
    select v_uid, v_deck, t.term, t.def, now() + t.n * interval '1 millisecond'
    from (values
      (1,  'car park',          'chỗ đỗ xe'),
      (2,  'workspace',         'không gian làm việc'),
      (3,  'area for relaxing', 'khu vực thư giãn'),
      (4,  'quiet area',        'khu vực yên tĩnh'),
      (5,  'access',            'cách thức để tới địa điểm nào đó (thang máy, cầu thang bộ)'),
      (6,  'stairs',            'cầu thang bộ'),
      (7,  'lift',              'thang máy'),
      (8,  'available',         'có sẵn để sử dụng (ví dụ, ghế này chưa có ai ngồi, phòng máy tính còn chỗ để ngồi)'),
      (9,  'projector',         'máy chiếu'),
      (10, 'facilities',        'tiện nghi, cơ sở vật chất (phòng gym, phòng ăn ...)'),
      (11, 'employee survey',   'khảo sát nhân viên'),
      (12, 'improve',           'cải thiện'),
      (13, 'department',        'phòng ban, bộ phận'),
      (14, 'workplace',         'nơi làm việc'),
      (15, 'book',              'đặt phòng'),
      (16, 'take a break',      'nghỉ giải lao'),
      (17, 'working hours',     'giờ làm việc'),
      (18, 'equipment',         'thiết bị'),
      (19, 'safety goggles',    'kính bảo vệ'),
      (20, 'drag',              'kéo lê (trên mặt đất)'),
      (21, 'fall',              'rơi xuống'),
      (22, 'remove',            'loại bỏ'),
      (23, 'metal object',      'vật làm bằng kim loại'),
      (24, 'metal bar',         'thanh kim loại'),
      (25, 'weld',              'hàn (sắt, ....)'),
      (26, 'outdoor lot',       'lô đất ngoài trời'),
      (27, 'install',           'lắp đặt'),
      (28, 'light',             'đèn'),
      (29, 'demonstrate',       'hướng dẫn cách làm một việc gì đó để ai đó biết cách làm'),
      (30, 'adjust',            'điều chỉnh'),
      (31, 'look at each other','nhìn nhau'),
      (32, 'light fixture',     'đèn chùm to'),
      (33, 'cement',            'xi măng'),
      (34, 'shovel',            'xúc đất (bằng xẻng)'),
      (35, 'dirt',              'đất bùn'),
      (36, 'sharpen a pencil',  'gọt bút chì'),
      (37, 'blind',             'mành cuốn (cửa sổ)')
    ) as t(n, term, def);
  end if;
end $$;
