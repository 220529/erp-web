# ERP-WEB 与 ERP-CORE 集成总结

## ✅ 已完成的工作

### 1. 创建前端常量枚举（新增）

**文件**: `src/constants/enums.ts`

- ✅ 定义了所有与后端一致的枚举类型
- ✅ 包含枚举标签映射 `EnumLabels`
- ✅ 包含枚举颜色映射 `EnumColors`（用于 Ant Design Tag 组件）

**枚举列表**:

- `UserRole` - 用户角色
- `CustomerStatus` - 客户状态
- `FollowType` - 跟进类型
- `OrderStatus` - 订单状态
- `MaterialCategory` - 材料类别
- `MaterialStatus` - 材料状态
- `PaymentType` - 收款类型
- `PaymentStatus` - 收款状态
- `ProjectStatus` - 项目状态

---

### 2. 更新前端类型定义（匹配后端）

#### ✅ 客户模块 (`src/features/customer/types.ts`)

**主要变更**:

- `phone` → `mobile` （字段名统一）
- 添加 `area` 字段（所属区域）
- 添加 `status` 枚举字段
- 添加 `salesId`, `designerId` 字段
- 添加 `CustomerFollow` 跟进记录类型

#### ✅ 订单模块 (`src/features/order/types.ts`)

**主要变更**:

- `number` → `orderNo` （字段名统一）
- 添加 `customerId` 字段
- 添加 `status` 枚举字段
- 添加 `paidAmount`, `costAmount` 字段
- 添加 `signedAt`, `startedAt`, `completedAt` 时间字段
- 添加 `salesId`, `designerId`, `foremanId` 字段

#### ✅ 项目模块 (`src/features/project/types.ts`)

**主要变更**:

- 添加 `projectNo` 字段（项目编号）
- 添加 `orderId`, `customerId` 关联字段
- 添加 `name`, `address` 字段
- 添加 `status` 枚举字段

#### ✅ 物料模块 (`src/features/material/types.ts`)

**主要变更**:

- 添加 `category` 枚举字段
- 添加 `brand`, `spec` 字段
- 添加 `costPrice`, `salePrice` 字段
- 添加 `imageUrl` 字段
- 添加 `status` 枚举字段

#### ✅ 财务模块 (`src/features/finance/types.ts`)

**主要变更**:

- `number` → `paymentNo` （字段名统一）
- 添加 `orderId` 关联字段
- 添加 `type` 枚举字段（收款类型）
- 添加 `status` 枚举字段
- 添加 `paidAt` 字段（实际收款时间）
- 添加 `createdBy` 字段（创建人）

#### ✅ 公司/部门模块 (`src/features/company/types.ts`)

**新增内容**:

- 添加 `Department` 类型定义
- 添加 `CreateDepartmentDto`, `UpdateDepartmentDto`
- 更新 `Company` 类型以匹配后端

---

### 3. 更新 API 接口（匹配后端路由）

#### ✅ 客户 API (`src/api/customer.ts`)

**主要变更**:

- `/api/customer` → `/api/customers`
- 查询参数：`phone` → `mobile`
- 添加 `status`, `salesId` 查询参数
- 添加客户跟进记录 API:
  - `listCustomerFollows(customerId)`
  - `createCustomerFollow(customerId, data)`

#### ✅ 订单 API (`src/api/order.ts`)

**主要变更**:

- `/api/order` → `/api/orders`
- 查询参数：`number` → `orderNo`
- 查询参数：`customerName` → `customerId`
- 查询参数类型：`status?: number` → `status?: string`

#### ✅ 项目 API (`src/api/project.ts`)

**主要变更**:

- `/api/project` → `/api/projects`
- 查询参数：添加 `projectNo`, `orderId`
- 查询参数类型：`status?: number` → `status?: string`

#### ✅ 公司 API (`src/api/company.ts`)

**主要变更**:

- `/api/company` → `/api/companies`
- 添加部门管理完整 API:
  - `listDepartments(params)`
  - `getDepartment(id)`
  - `createDepartment(data)`
  - `updateDepartment(data)`
  - `deleteDepartment(id)`

---

### 4. 字典管理（完全重构）

#### ✅ 后端实体

- **新增**: `src/entities/dict-type.entity.ts` (字典类型表)
- **新增**: `src/entities/dict-data.entity.ts` (字典数据表)
- **删除**: `src/entities/dict.entity.ts` (旧单表结构)

#### ✅ 后端 DTO

- **新增**: `src/modules/dict/dto/dict-type.dto.ts`
- **新增**: `src/modules/dict/dto/dict-data.dto.ts`

#### ✅ 后端业务逻辑

- **新增**: `src/modules/dict/dict.service.ts` (完整 CRUD + 关联验证)
- **新增**: `src/modules/dict/dict.controller.ts` (RESTful API)
- **新增**: `src/modules/dict/dict.module.ts`
- ✅ 已注册到 `src/app.module.ts`

#### ✅ 前端实现

- **更新**: `src/features/dict/types.ts` (两级类型定义)
- **更新**: `src/api/dict.ts` (完整两级 API)
- **更新**: `src/features/dict/List.tsx` (左右分栏 UI)
- **更新**: `src/features/dict/config.tsx` (列配置)
- **更新**: `src/features/dict/index.module.less` (样式)

---

## ⚠️ 需要注意的变更

### 1. API 路径变更

所有 API 路径从单数改为复数形式：

| 旧路径          | 新路径           |
| --------------- | ---------------- |
| `/api/customer` | `/api/customers` |
| `/api/order`    | `/api/orders`    |
| `/api/project`  | `/api/projects`  |
| `/api/material` | `/api/materials` |
| `/api/payment`  | `/api/payments`  |
| `/api/company`  | `/api/companies` |

### 2. 字段名变更

| 模块     | 旧字段名 | 新字段名           |
| -------- | -------- | ------------------ |
| Customer | `phone`  | `mobile`           |
| Order    | `number` | `orderNo`          |
| Project  | -        | `projectNo` (新增) |
| Payment  | `number` | `paymentNo`        |

### 3. 枚举类型

所有状态字段现在使用字符串枚举而非数字：

```typescript
// 旧方式（数字）
status: 0 | 1 | 2

// 新方式（字符串枚举）
status: OrderStatus.DRAFT | OrderStatus.SIGNED | ...
```

---

## 📋 后续需要完成的工作

### 1. 更新前端页面组件

所有列表页面需要更新以使用新的枚举和字段名：

#### ❌ 客户列表 (`src/features/customer/List.tsx`)

- [ ] 更新搜索字段：`phone` → `mobile`
- [ ] 添加状态筛选（使用 `CustomerStatus` 枚举）
- [ ] 更新列配置以显示新字段
- [ ] 添加客户跟进记录功能

#### ❌ 订单列表 (`src/features/order/List.tsx`)

- [ ] 更新字段：`number` → `orderNo`
- [ ] 添加状态标签（使用 `EnumLabels` 和 `EnumColors`）
- [ ] 更新表单以包含新字段
- [ ] 添加关联客户选择器

#### ❌ 项目列表 (`src/features/project/List.tsx`)

- [ ] 添加 `projectNo` 字段显示
- [ ] 添加状态标签
- [ ] 添加关联订单选择器
- [ ] 移除旧的 `progress` 进度条（后端无此字段）

#### ❌ 物料列表 (`src/features/material/List.tsx`)

- [ ] 更新分类选择器（使用 `MaterialCategory` 枚举）
- [ ] 添加 `costPrice`, `salePrice` 字段
- [ ] 添加图片上传功能
- [ ] 更新状态标签

#### ❌ 财务列表 (`src/features/finance/List.tsx`)

- [ ] 更新字段：`number` → `paymentNo`
- [ ] 添加收款类型选择器（使用 `PaymentType` 枚举）
- [ ] 添加关联订单选择器
- [ ] 更新状态标签

---

### 2. 创建缺失的功能模块

#### ❌ 部门管理 (`src/features/department/`)

- [ ] 创建 `List.tsx` 部门列表页
- [ ] 支持树形结构展示（`parentId`）
- [ ] 关联公司选择

#### ❌ 客户跟进 (`src/features/customer/` 子模块)

- [ ] 在客户详情页添加跟进记录tab
- [ ] 创建跟进记录表单
- [ ] 显示跟进时间线

---

### 3. 公共组件优化

#### ❌ 创建选择器组件

- [ ] `CustomerSelect.tsx` - 客户选择器
- [ ] `OrderSelect.tsx` - 订单选择器
- [ ] `UserSelect.tsx` - 用户选择器（销售、设计师、工长）
- [ ] `CompanySelect.tsx` - 公司选择器
- [ ] `DepartmentSelect.tsx` - 部门选择器

#### ❌ 创建枚举展示组件

- [ ] `StatusTag.tsx` - 统一的状态标签组件
- [ ] 自动根据枚举值显示对应颜色和文本

---

### 4. 后端缺失模块（需要在 erp-core 中添加）

#### ❌ 公司管理模块

- [ ] 创建 `src/modules/companies/` 模块
- [ ] Service, Controller, Module

#### ❌ 部门管理模块

- [ ] 创建 `src/modules/departments/` 模块
- [ ] 支持树形结构查询

#### ❌ 客户跟进模块

- [ ] 在 `customers` 模块中添加跟进记录 API
- [ ] `GET /api/customers/:id/follows`
- [ ] `POST /api/customers/:id/follows`

---

## 🎯 使用示例

### 1. 使用枚举常量

```typescript
import { CustomerStatus, EnumLabels, EnumColors } from '@/constants/enums'
import { Tag } from 'antd'

// 创建客户时指定状态
const newCustomer = {
  name: '张三',
  mobile: '13800138000',
  status: CustomerStatus.NEW,
}

// 显示状态标签
<Tag color={EnumColors.CustomerStatus[customer.status]}>
  {EnumLabels.CustomerStatus[customer.status]}
</Tag>
```

### 2. 调用 API

```typescript
import { customerApi } from "@/api";
import { CustomerStatus } from "@/constants/enums";

// 查询客户列表
const result = await customerApi.listCustomers({
  page: 1,
  pageSize: 20,
  status: CustomerStatus.NEW,
});

// 创建客户
const customer = await customerApi.createCustomer({
  name: "李四",
  mobile: "13900139000",
  address: "北京市朝阳区",
});
```

---

## 📝 数据库迁移提示

如果需要从旧字典表迁移到新字典表：

```sql
-- 1. 创建字典类型（示例）
INSERT INTO dict_types (code, name, sort, status)
VALUES ('customer_source', '客户来源', 1, 1);

-- 2. 迁移字典数据（示例）
INSERT INTO dict_data (type_code, label, value, sort, status)
SELECT
  'customer_source' as type_code,
  value as label,
  key as value,
  sort,
  status
FROM dicts
WHERE type = 'customer_source';
```

---

## 🚀 下一步建议

1. **先更新基础模块**：客户、订单、项目
2. **再添加关联功能**：客户跟进、订单物料
3. **最后完善辅助模块**：部门管理、文件管理

建议按模块逐个更新测试，确保前后端数据结构完全匹配。
