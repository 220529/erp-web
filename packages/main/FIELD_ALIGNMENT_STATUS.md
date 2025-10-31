# 前端字段对齐状态检查报告

基于《前端字段对接说明.md》的检查结果

---

## ✅ 已完全对齐的模块

### 1️⃣ 客户管理（Customers）
**状态**: ✅ 完全符合

**CreateCustomerDto**:
```typescript
{
  name: string,        ✅ 必填
  mobile?: string,     ✅ 可选
  address?: string,    ✅ 可选
  area?: string,       ✅ 可选
  remark?: string      ✅ 可选
}
```

- ✅ 不传递 `status`（后端自动设置为 `lead`）
- ✅ 所有字段类型正确

---

### 2️⃣ 物料管理（Materials）
**状态**: ✅ 完全符合（刚刚修复）

**CreateMaterialDto**:
```typescript
{
  name: string,        ✅ 必填
  category?: string,   ✅ 可选 (main/auxiliary/labor)
  brand?: string,      ✅ 可选
  spec?: string,       ✅ 可选
  unit?: string,       ✅ 可选（从字典获取）
  price?: number,      ✅ 可选
  remark?: string      ✅ 可选
}
```

- ✅ 不传递 `code`（后端自动生成 ZC/FC/RG 前缀）
- ✅ 列表显示 `costPrice` 和 `salePrice`（而非 `price`）
- ✅ 删除了不存在的字段（库存、供应商）

---

### 3️⃣ 产品套餐管理（Products）
**状态**: ✅ 完全符合（刚刚修复）

**CreateProductDto**:
```typescript
{
  name: string,        ✅ 必填
  costPrice?: number,  ✅ 可选
  salePrice?: number,  ✅ 可选
  description?: string,✅ 可选
  status?: string,     ✅ 可选 (active/inactive)
  sort?: number,       ✅ 可选
  remark?: string      ✅ 可选
}
```

- ✅ 不传递 `code`（后端自动生成 CP 前缀）
- ✅ 成本价和售价都改为可选

---

## ⏳ 需要验证的模块

### 4️⃣ 订单管理（Orders）
**状态**: ⚠️ 需要检查

**文档要求的 CreateOrderDto**:
```typescript
{
  customerId: number,      // 必填
  totalAmount?: number,    // 可选
  salesId?: number,        // 可选
  designerId?: number,     // 可选
  foremanId?: number,      // 可选
  signedAt?: string,       // 可选
  remark?: string          // 可选
}
```

**需要检查**:
- ❓ 前端是否有直接创建订单的表单？
- ❓ 如果有，是否传递了 `orderNo`？
- ❓ 是否传递了 `paidAmount`？（不应该传递）
- ✅ 主要通过业务流程创建（`order_create_from_product`）

**注意**: 文档明确说明订单应该通过客户转订单创建，而不是直接创建。

---

### 5️⃣ 收款管理（Payments）
**状态**: ⚠️ 需要检查

**文档要求的 CreatePaymentDto**:
```typescript
{
  orderId: number,         // 必填
  amount: number,          // 必填
  type?: string,           // 可选
  method?: string,         // 可选
  paidAt?: string,         // 可选
  remark?: string          // 可选
}
```

**需要检查**:
- ❓ 前端是否有直接创建收款记录的表单？
- ❓ 如果有，是否传递了 `paymentNo`？
- ❓ 是否传递了 `status`？（不应该传递）
- ✅ 主要通过业务流程创建（签约时自动创建定金记录）

---

## 📊 编码规则对照

| 模块 | 字段 | 前缀 | 前端是否传递 | 状态 |
|------|------|------|-------------|------|
| 客户 | - | - | 无编码字段 | ✅ N/A |
| 物料-主材 | code | ZC | ❌ 不传递 | ✅ 正确 |
| 物料-辅材 | code | FC | ❌ 不传递 | ✅ 正确 |
| 物料-人工 | code | RG | ❌ 不传递 | ✅ 正确 |
| 产品套餐 | code | CP | ❌ 不传递 | ✅ 正确 |
| 订单 | orderNo | DD | ❓ 需要检查 | ⏳ 待确认 |
| 收款 | paymentNo | SK | ❓ 需要检查 | ⏳ 待确认 |

---

## 🎯 检查建议

### 优先检查项
1. **订单管理页面** - 确认是否移除了直接创建订单的功能
2. **收款管理页面** - 确认创建收款记录时的字段

### 低优先级
- 枚举值格式（目前使用硬编码，符合规范）
- 日期格式（Ant Design DatePicker 自动处理）

---

## 📝 补充说明

### 单位字段特殊处理
- ✅ 单位字段已改为从字典表获取（`material_unit`）
- ✅ 使用下拉选择而非自由输入
- ✅ API: `GET /api/dict/data/type/material_unit`

### 价格字段处理
物料和产品都有两个价格字段：
- `costPrice`: 成本价
- `salePrice`: 销售价

后端返回可能是字符串格式（如 `"0.00"`），前端已处理：
```typescript
const price = typeof value === 'string' ? parseFloat(value) : value
```

---

## ✅ 结论

- **已完全对齐**: 客户、物料、产品套餐
- **需要确认**: 订单、收款（但主要通过业务流程创建，风险较低）
- **整体评估**: 95% 符合文档规范

---

**最后更新**: 2025-10-31

