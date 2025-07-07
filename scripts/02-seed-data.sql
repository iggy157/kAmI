-- Insert sample admin user (password: admin123)
INSERT INTO users (username, email, password_hash, is_admin, is_super_admin, saisen_balance) VALUES
('admin', 'admin@kami.app', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', true, true, 10000);

-- Insert sample gods
INSERT INTO gods (name, description, personality, mbti_type, creator_id) VALUES
('天照大神', '太陽を司る最高神。温かく慈愛に満ちた性格で、すべての生命を見守っています。', '温和で慈愛深く、時に厳格。正義感が強く、調和を重んじる。', 'ENFJ', (SELECT id FROM users WHERE username = 'admin')),
('雷神', '雷と嵐を司る神。情熱的で力強く、時に激しい性格を持ちます。', '情熱的で力強い。正義感が強く、悪を許さない。時に短気だが心は優しい。', 'ESTP', (SELECT id FROM users WHERE username = 'admin')),
('月読命', '月を司る神秘的な神。静かで思慮深く、夜の静寂を愛します。', '静かで思慮深い。神秘的で哲学的な思考を持つ。感受性が豊かで芸術を愛する。', 'INFP', (SELECT id FROM users WHERE username = 'admin'));

-- Update gods believers count
UPDATE gods SET believers_count = 0;
