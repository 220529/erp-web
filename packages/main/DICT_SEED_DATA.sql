-- ========================================
-- 字典表初始化数据
-- ========================================

-- 1. 创建物料单位字典类型
INSERT INTO dict_types (code, name, sort, status, remark, created_at, updated_at) 
VALUES ('material_unit', '物料单位', 1, 1, '物料管理中使用的单位', NOW(), NOW());

-- 2. 创建物料单位字典数据
INSERT INTO dict_data (type_code, label, value, sort, status, remark, created_at, updated_at) VALUES
('material_unit', '平方米', 'm2', 1, 1, '面积单位', NOW(), NOW()),
('material_unit', '米', 'm', 2, 1, '长度单位', NOW(), NOW()),
('material_unit', '厘米', 'cm', 3, 1, '长度单位', NOW(), NOW()),
('material_unit', '个', 'piece', 4, 1, '计数单位', NOW(), NOW()),
('material_unit', '套', 'set', 5, 1, '成套单位', NOW(), NOW()),
('material_unit', '件', 'item', 6, 1, '计数单位', NOW(), NOW()),
('material_unit', '张', 'sheet', 7, 1, '计数单位', NOW(), NOW()),
('material_unit', '块', 'block', 8, 1, '计数单位', NOW(), NOW()),
('material_unit', '片', 'slice', 9, 1, '计数单位', NOW(), NOW()),
('material_unit', '吨', 'ton', 10, 1, '重量单位', NOW(), NOW()),
('material_unit', '千克', 'kg', 11, 1, '重量单位', NOW(), NOW()),
('material_unit', '克', 'g', 12, 1, '重量单位', NOW(), NOW()),
('material_unit', '升', 'liter', 13, 1, '体积单位', NOW(), NOW()),
('material_unit', '毫升', 'ml', 14, 1, '体积单位', NOW(), NOW()),
('material_unit', '立方米', 'm3', 15, 1, '体积单位', NOW(), NOW()),
('material_unit', '箱', 'box', 16, 1, '包装单位', NOW(), NOW()),
('material_unit', '包', 'package', 17, 1, '包装单位', NOW(), NOW()),
('material_unit', '袋', 'bag', 18, 1, '包装单位', NOW(), NOW()),
('material_unit', '卷', 'roll', 19, 1, '包装单位', NOW(), NOW()),
('material_unit', '桶', 'barrel', 20, 1, '包装单位', NOW(), NOW()),
('material_unit', '罐', 'can', 21, 1, '包装单位', NOW(), NOW()),
('material_unit', '瓶', 'bottle', 22, 1, '包装单位', NOW(), NOW()),
('material_unit', '扎', 'bundle', 23, 1, '包装单位', NOW(), NOW()),
('material_unit', '根', 'root', 24, 1, '计数单位', NOW(), NOW()),
('material_unit', '条', 'strip', 25, 1, '计数单位', NOW(), NOW()),
('material_unit', '盒', 'case', 26, 1, '包装单位', NOW(), NOW()),
('material_unit', '组', 'group', 27, 1, '成套单位', NOW(), NOW()),
('material_unit', '人工', 'labor', 28, 1, '人工单位', NOW(), NOW()),
('material_unit', '工日', 'workday', 29, 1, '人工单位', NOW(), NOW()),
('material_unit', '工时', 'hour', 30, 1, '人工单位', NOW(), NOW());

-- ========================================
-- 其他常用字典类型（可选）
-- ========================================

-- 客户来源
INSERT INTO dict_types (code, name, sort, status, remark, created_at, updated_at) 
VALUES ('customer_source', '客户来源', 2, 1, '客户的来源渠道', NOW(), NOW());

INSERT INTO dict_data (type_code, label, value, sort, status, css_class, created_at, updated_at) VALUES
('customer_source', '线上推广', 'online', 1, 1, 'primary', NOW(), NOW()),
('customer_source', '老客户介绍', 'referral', 2, 1, 'success', NOW(), NOW()),
('customer_source', '展会活动', 'exhibition', 3, 1, 'warning', NOW(), NOW()),
('customer_source', '电话营销', 'telemarketing', 4, 1, 'info', NOW(), NOW()),
('customer_source', '门店到访', 'walk_in', 5, 1, 'default', NOW(), NOW()),
('customer_source', '其他', 'other', 6, 1, 'default', NOW(), NOW());

-- 收款方式
INSERT INTO dict_types (code, name, sort, status, remark, created_at, updated_at) 
VALUES ('payment_method', '收款方式', 3, 1, '收款的支付方式', NOW(), NOW());

INSERT INTO dict_data (type_code, label, value, sort, status, css_class, created_at, updated_at) VALUES
('payment_method', '现金', 'cash', 1, 1, 'success', NOW(), NOW()),
('payment_method', '银行转账', 'bank_transfer', 2, 1, 'primary', NOW(), NOW()),
('payment_method', '微信', 'wechat', 3, 1, 'success', NOW(), NOW()),
('payment_method', '支付宝', 'alipay', 4, 1, 'primary', NOW(), NOW()),
('payment_method', 'POS机', 'pos', 5, 1, 'info', NOW(), NOW()),
('payment_method', '支票', 'check', 6, 1, 'warning', NOW(), NOW()),
('payment_method', '其他', 'other', 7, 1, 'default', NOW(), NOW());

-- ========================================
-- 验证查询
-- ========================================

-- 查看已创建的字典类型
SELECT * FROM dict_types WHERE code IN ('material_unit', 'customer_source', 'payment_method');

-- 查看物料单位字典数据
SELECT * FROM dict_data WHERE type_code = 'material_unit' ORDER BY sort;

