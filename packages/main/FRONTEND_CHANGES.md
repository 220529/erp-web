# 前端字段对接调整说明

## ✅ 已完成的调整

根据后端字段对接文档，已对前端代码进行以下调整：

---

## 1️⃣ 物料管理（Materials）

### 调整内容

#### ❌ 删除了后端自动生成的字段

- **物料编码（code）** - 由后端根据物料类别自动生成（ZC/FC/RG前缀）
- 前端创建物料时**不再传递** `code` 字段

#### ✅ 修正了枚举值

**物料类别从错误值改为正确值：**

- ~~mainMaterial~~ → `main` （主材）
- ~~craft~~ → `auxiliary` （辅材）
- ~~baseMaterial~~ → `labor` （人工）
- ~~service~~ → 删除

#### ✅ 优化了表单字段

**创建/编辑物料表单字段：**

- 物料名称（name）- 必填
- 物料类别（category）- 可选：main/auxiliary/labor（下拉选择）
- 品牌（brand）- 可选（自由输入）
- 规格型号（spec）- 可选（自由输入）
- 单位（unit）- 可选（**从接口获取**，下拉选择）
- 单价（price）- 可选（数字输入）
- 备注（remark）- 可选（文本域）

**删除了不存在的字段：**

- ~~库存（stock）~~
- ~~供应商（supplierName）~~

#### ✅ 更新了类型定义

```typescript
// packages/main/src/features/material/types.ts
export interface CreateMaterialDto {
  name: string; // 必填：物料名称
  category?: string; // 可选：物料类别
  brand?: string; // 可选：品牌
  spec?: string; // 可选：规格型号
  unit?: string; // 可选：单位
  price?: number; // 可选：单价
  remark?: string; // 可选：备注
}
```

**不再包含后端自动生成的字段：**

- ~~code~~（物料编码）

---

## 2️⃣ 常量接口集成

### ✅ 新增常量API模块

**文件**：`packages/main/src/api/constants.ts`

**可用接口**：

```typescript
// 获取所有常量（一次性）
getAllConstants(): Promise<Record<string, ConstantOption[]>>

// 获取各类枚举常量
getMaterialCategories(): Promise<ConstantOption[]>  // 物料类别
getMaterialStatuses(): Promise<ConstantOption[]>    // 物料状态
getOrderStatuses(): Promise<ConstantOption[]>       // 订单状态
getPaymentTypes(): Promise<ConstantOption[]>        // 收款类型
getCustomerStatuses(): Promise<ConstantOption[]>    // 客户状态
getProductStatuses(): Promise<ConstantOption[]>     // 产品状态
getUserRoles(): Promise<ConstantOption[]>           // 用户角色

// 获取单位列表
getUnits(): Promise<ConstantOption[]>               // 单位列表（✨ 新增）
```

**常量选项格式**：

```typescript
interface ConstantOption {
  label: string; // 显示文本（如："平方米"）
  value: string; // 实际值（如："m2"）
  description?: string; // 可选描述
}
```

### ✅ 单位字段改为接口获取

**物料管理模块**：

- 单位字段从**自由输入**改为**下拉选择**
- 启动时自动调用 `constantsApi.getUnits()` 获取单位列表
- 支持搜索过滤（`showSearch`）
- 支持清空选择（`allowClear`）

**使用示例**：

```typescript
// 组件中
const [units, setUnits] = useState<ConstantOption[]>([])

// 加载单位
const result = await constantsApi.getUnits()
setUnits(result)

// 渲染下拉框
<Select
  options={units.map(u => ({
    label: u.label,   // 显示："平方米"
    value: u.value    // 值："m2"
  }))}
/>
```

---

## 3️⃣ 枚举常量定义

### 已验证正确的枚举值

```typescript
// packages/main/src/constants/enums.ts

// ✅ 物料类别
export enum MaterialCategory {
  MAIN = "main", // 主材
  AUXILIARY = "auxiliary", // 辅材
  LABOR = "labor", // 人工
}

// ✅ 客户状态
export enum CustomerStatus {
  NEW = "new", // 新客户
  MEASURED = "measured", // 已量房（初版不用）
  QUOTED = "quoted", // 已报价
  SIGNED = "signed", // 已签约
  COMPLETED = "completed", // 已完工
}

// ✅ 订单状态
export enum OrderStatus {
  DRAFT = "draft", // 草稿
  SIGNED = "signed", // 已签约
  IN_PROGRESS = "in_progress", // 施工中
  COMPLETED = "completed", // 已完工
  CANCELLED = "cancelled", // 已取消
}

// ✅ 收款类型
export enum PaymentType {
  DEPOSIT = "deposit", // 定金
  CONTRACT = "contract", // 合同款
  DESIGN_FEE = "design_fee", // 设计费
  ADDITION = "addition", // 增项款
}

// ✅ 收款状态
export enum PaymentStatus {
  PENDING = "pending", // 待确认
  CONFIRMED = "confirmed", // 已确认
  CANCELLED = "cancelled", // 已取消
}
```

---

## 3️⃣ 其他模块验证

### 客户管理（Customers）

✅ **字段正确**：

- 不传递 `status`（后端自动设置为 `new`）
- 只传递：name, mobile, address, area, remark

### 订单管理（Orders）

✅ **字段正确**：

- 不传递 `orderNo`（后端自动生成 DD 前缀）
- 不传递 `paidAmount`（初始为0，由收款确认后累加）
- 订单创建通过业务流程 `order_create_from_product`

### 收款管理（Payments）

✅ **字段正确**：

- 不传递 `paymentNo`（后端自动生成 SK 前缀）
- 不传递 `status`（后端自动设置为 `pending`）

---

## 4️⃣ 搜索条件说明

### ⚠️ 搜索表单可以使用编码字段

以下字段在**搜索表单**中可以使用（用于过滤）：

- `code` - 物料编码
- `orderNo` - 订单编号
- `paymentNo` - 收款单号

但在**创建/编辑表单**中不能传递这些字段！

---

## 📊 编码规则对照表

| 模块      | 字段      | 前缀 | 示例           | 前端是否传递 |
| --------- | --------- | ---- | -------------- | ------------ |
| 物料-主材 | code      | ZC   | ZC202510310001 | ❌ 后端生成  |
| 物料-辅材 | code      | FC   | FC202510310001 | ❌ 后端生成  |
| 物料-人工 | code      | RG   | RG202510310001 | ❌ 后端生成  |
| 产品套餐  | code      | CP   | CP202510310001 | ❌ 后端生成  |
| 订单      | orderNo   | DD   | DD202510310001 | ❌ 后端生成  |
| 收款      | paymentNo | SK   | SK202510310001 | ❌ 后端生成  |

---

## 🔍 验证方法

### 测试创建物料

```typescript
// ✅ 正确的请求体
{
  "name": "瓷砖",
  "category": "main",
  "brand": "马可波罗",
  "spec": "800x800",
  "unit": "平方米",
  "price": 200,
  "remark": "客厅使用"
}

// ❌ 错误的请求体（不要传 code）
{
  "code": "ZC202510310001",  // ❌ 不要传
  "name": "瓷砖",
  // ...
}
```

### 测试物料类别

```typescript
// ✅ 正确的类别值
category: "main"; // 主材
category: "auxiliary"; // 辅材
category: "labor"; // 人工

// ❌ 错误的类别值
category: "mainMaterial"; // ❌ 已废弃
category: "craft"; // ❌ 已废弃
```

---

## 📝 待验证的其他模块

虽然已检查代码，但建议实际测试以下模块：

### 产品套餐（Products）

- ✅ 不传递 `code`（后端生成 CP 前缀）
- ✅ `status` 默认为 `active`

### 订单明细（OrderMaterials）

- ✅ 由业务流程自动创建（从套餐复制）
- ✅ 编辑明细时传递：orderMaterialId, quantity, price

---

## 🚨 重要提醒

### ❌ 永远不要传递的字段

1. **所有编码/编号字段**：
   - code、orderNo、paymentNo、productCode 等
2. **初始状态字段**（创建时）：
   - 初始状态由后端自动设置
3. **累计金额字段**：
   - paidAmount（已收金额）- 由收款确认后自动累加
4. **时间戳字段**：
   - createdAt、updatedAt - 由数据库自动管理

### ✅ 字段格式约定

**日期格式**：

```javascript
"2025-10-31T12:00:00.000Z"; // ✅ ISO 8601
"2025-10-31"; // ✅ 简化日期
```

**枚举值**：

```javascript
status: "active"; // ✅ 小写英文
status: "ACTIVE"; // ❌ 大写
status: "启用"; // ❌ 中文
```

---

## 📦 已修改的文件

1. ✅ `packages/main/src/api/constants.ts` **（新增）**
   - 常量接口模块
   - 包含获取单位、枚举等接口

2. ✅ `packages/main/src/api/index.ts`
   - 导出 constantsApi

3. ✅ `packages/main/src/features/material/List.tsx`
   - 删除物料编码输入字段
   - 修正物料类别枚举值
   - 简化表单字段
   - **单位改为从接口获取的下拉选择**

4. ✅ `packages/main/src/features/material/config.tsx`
   - 更新物料类别映射（main/auxiliary/labor）

5. ✅ `packages/main/src/features/material/types.ts`
   - 更新 CreateMaterialDto 定义
   - 移除 code 字段

6. ✅ `packages/main/src/constants/enums.ts`
   - 验证所有枚举值正确

---

## 🎯 下一步

### 1️⃣ **后端配置字典数据**

✅ **接口已存在**：`GET /api/dict/data/type/:typeCode`

只需在字典表中添加单位数据即可：

**字典类型（dict_types 表）**：

```sql
INSERT INTO dict_types (code, name, sort, status, remark)
VALUES ('material_unit', '物料单位', 1, 1, '物料管理中使用的单位');
```

**字典数据（dict_data 表）**：

```sql
INSERT INTO dict_data (type_code, label, value, sort, status, remark) VALUES
('material_unit', '平方米', 'm2', 1, 1, '面积单位'),
('material_unit', '米', 'm', 2, 1, '长度单位'),
('material_unit', '个', 'piece', 3, 1, '计数单位'),
('material_unit', '套', 'set', 4, 1, NULL),
('material_unit', '吨', 'ton', 5, 1, '重量单位'),
('material_unit', '千克', 'kg', 6, 1, '重量单位'),
('material_unit', '升', 'liter', 7, 1, '体积单位'),
('material_unit', '箱', 'box', 8, 1, NULL),
('material_unit', '包', 'package', 9, 1, NULL),
('material_unit', '卷', 'roll', 10, 1, NULL);
```

**前端调用**：

```typescript
// 自动调用：GET /api/dict/data/type/material_unit
const units = await constantsApi.getUnits();
```

### 2️⃣ **启动测试**

```bash
# 启动前端
cd E:\frame\erp-web
pnpm --filter @erp/main dev
```

### 3️⃣ **测试创建物料**

- 验证单位下拉框是否正常显示
- 创建主材（验证编码以 ZC 开头）
- 创建辅材（验证编码以 FC 开头）
- 创建人工（验证编码以 RG 开头）

### 4️⃣ **验证其他模块**

- 创建订单（验证编号以 DD 开头）
- 创建收款（验证单号以 SK 开头）

---

**状态**: ✅ 物料管理模块已完全对齐后端接口  
**待办**: ⚠️ 后端需在字典表中添加 `material_unit` 类型的单位数据
