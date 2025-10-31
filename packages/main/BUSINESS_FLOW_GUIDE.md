# ERP 系统业务流程指南

## 🎯 系统定位

初版ERP是一个**简单的数据录入系统**，核心功能包括：客户管理、订单管理、收款管理。

---

## 📊 完整业务流程

```
1. 创建客户 (LEAD)
   ↓
2. 客户详情 → 转订单 → 选择套餐
   ↓
3. 订单创建成功 (DRAFT) → 客户状态变为 QUOTED
   ↓
4. 订单详情 → 编辑明细（可选）
   ↓
5. 订单签约 (SIGNED) → 客户状态变为 SIGNED → 创建定金收款记录
   ↓
6. 财务管理 → 确认收款 → 订单已收金额增加
   ↓
7. 订单开工 (IN_PROGRESS)
   ↓
8. 订单完工 (COMPLETED) → 客户状态变为 COMPLETED
```

---

## 🔌 后端业务流程对接

所有业务流程已在 `erp-code` 项目中实现，调用方式：

```
POST http://localhost:3009/api/code/run/{flowKey}
Body: { params: { ... } }
```

### 1️⃣ 从套餐创建订单

**流程名称**: `order_create_from_product`  
**前端调用**: `codeflowApi.orderCreateFromProduct({ customerId, productId, remark })`

**参数**:
```javascript
{
  customerId: number,    // 必填
  productId: number,     // 必填
  remark?: string        // 可选
}
```

**业务逻辑**:
- 生成订单编号: `ORD + YYYYMMDD + 4位随机数`
- 创建订单，状态为 `draft`
- 从套餐复制物料到订单明细
- 订单总金额 = 套餐售价
- 客户状态更新为 `quoted`

**返回**:
```javascript
{
  success: true,
  data: {
    orderId: 1,
    orderNo: "ORD202510311234",
    totalAmount: 50000
  },
  message: "订单创建成功"
}
```

---

### 2️⃣ 更新订单明细

**流程名称**: `order_material_update`  
**前端调用**: `codeflowApi.orderMaterialUpdate({ orderMaterialId, quantity, price })`

**参数**:
```javascript
{
  orderMaterialId: number,  // 必填
  quantity: number,         // 必填，>0
  price: number             // 必填，>=0
}
```

**业务逻辑**:
- 更新明细的数量和单价
- 重新计算明细金额 = quantity × price
- 重新计算订单总金额 = sum(所有明细金额)

**返回**:
```javascript
{
  success: true,
  data: {
    amount: 10000,      // 明细金额
    totalAmount: 55000  // 订单总额
  },
  message: "订单明细更新成功"
}
```

---

### 3️⃣ 订单签约

**流程名称**: `order_sign`  
**前端调用**: `codeflowApi.orderSign({ orderId, depositAmount, paymentMethod })`

**参数**:
```javascript
{
  orderId: number,          // 必填
  depositAmount?: number,   // 可选，定金金额
  paymentMethod?: string    // 可选，默认 'cash'
}
```

**业务逻辑**:
- 订单状态更新为 `signed`
- 设置签约时间 `signedAt`
- 如有定金，创建收款记录（状态 `pending`）
- 客户状态更新为 `signed`

**状态校验**: 只有 `draft` 状态的订单才能签约

---

### 4️⃣ 确认收款

**流程名称**: `payment_confirm`  
**前端调用**: `codeflowApi.paymentConfirm({ paymentId, paidAt })`

**参数**:
```javascript
{
  paymentId: number,   // 必填
  paidAt?: string      // 可选，默认当前时间
}
```

**业务逻辑**:
- 收款状态更新为 `confirmed`
- 设置实际收款时间 `paidAt`
- 订单已收金额 += 收款金额

**返回**:
```javascript
{
  success: true,
  data: {
    paidAmount: 10000,    // 已收金额
    totalAmount: 50000,   // 订单总额
    unpaidAmount: 40000   // 未收金额
  },
  message: "收款确认成功"
}
```

**状态校验**: 只有 `pending` 状态的收款才能确认

---

### 5️⃣ 订单开工

**流程名称**: `order_start`  
**前端调用**: `codeflowApi.orderStart({ orderId, foremanId })`

**参数**:
```javascript
{
  orderId: number,      // 必填
  foremanId?: number    // 可选（初版不使用）
}
```

**业务逻辑**:
- 订单状态更新为 `in_progress`
- 设置开工时间 `startedAt`

**状态校验**: 只有 `signed` 状态的订单才能开工

---

### 6️⃣ 订单完工

**流程名称**: `order_complete`  
**前端调用**: `codeflowApi.orderComplete({ orderId })`

**参数**:
```javascript
{
  orderId: number  // 必填
}
```

**业务逻辑**:
- 订单状态更新为 `completed`
- 设置完工时间 `completedAt`
- 客户状态更新为 `completed`

**状态校验**: 只有 `in_progress` 状态的订单才能完工

---

## 🧪 完整测试流程

### 前置条件
1. 启动后端服务（erp-core）：`http://localhost:3009`
2. 启动代码流程服务（erp-code）
3. 启动前端服务（erp-web）：`http://localhost:3100`
4. 数据库中已有套餐数据（products 表）

### 测试步骤

#### ✅ 步骤1: 创建客户
1. 进入【客户管理】
2. 点击【新增客户】
3. 填写：姓名、电话、地址
4. 提交成功，客户状态为 `LEAD`

#### ✅ 步骤2: 转订单
1. 在客户列表点击【详情】
2. 点击【转订单】按钮（客户状态为 LEAD 时显示）
3. 选择套餐
4. 提交成功，自动跳转到订单详情页
5. 验证：
   - 订单状态为 `DRAFT`
   - 订单明细已自动复制套餐物料
   - 订单总金额 = 套餐售价
   - 客户状态变为 `QUOTED`

#### ✅ 步骤3: 编辑订单明细（可选）
1. 在订单详情页点击【添加明细】或【编辑】
2. 修改数量或单价
3. 保存后验证：
   - 明细金额自动更新
   - 订单总金额自动重新计算

#### ✅ 步骤4: 订单签约
1. 在订单详情页点击【签约】
2. 填写定金金额和支付方式
3. 提交成功，验证：
   - 订单状态变为 `SIGNED`
   - 有签约时间
   - 客户状态变为 `SIGNED`

#### ✅ 步骤5: 确认收款
1. 进入【收款管理】
2. 找到定金收款记录（状态为 `PENDING`）
3. 点击【确认收款】
4. 确认后验证：
   - 收款状态变为 `CONFIRMED`
   - 订单的已收金额增加
   - 未收金额减少

#### ✅ 步骤6: 订单开工
1. 返回订单详情页
2. 点击【开工】
3. 确认后验证：
   - 订单状态变为 `IN_PROGRESS`
   - 有开工时间

#### ✅ 步骤7: 订单完工
1. 在订单详情页点击【完工】
2. 确认后验证：
   - 订单状态变为 `COMPLETED`
   - 有完工时间
   - 客户状态变为 `COMPLETED`

---

## 🚨 状态流转规则

### 客户状态流转
```
LEAD (线索) 
  → QUOTED (已报价) [转订单后]
  → SIGNED (已签约) [订单签约后]
  → COMPLETED (已完工) [订单完工后]
```

### 订单状态流转
```
DRAFT (草稿) [创建后]
  → SIGNED (已签约) [签约后]
  → IN_PROGRESS (施工中) [开工后]
  → COMPLETED (已完工) [完工后]
```

### 收款状态流转
```
PENDING (待确认) [创建后]
  → CONFIRMED (已确认) [确认收款后]
```

**注意**: 所有状态只能单向流转，不能回退

---

## 📝 初版简化说明

为了快速上线，初版不关注以下功能：
- ❌ 角色管理（salesId, designerId, foremanId）
- ❌ 权限控制
- ❌ 复杂的业务规则校验
- ❌ 报表统计

这些功能可在后续版本中扩展。

---

## 🔧 技术架构

```
前端 (erp-web)
  ↓ HTTP Request
后端核心 (erp-core) - NestJS + TypeORM
  ↓ 调用业务流程
代码流程引擎 (erp-code) - 动态可热更新的业务逻辑
  ↓ 操作数据库
MySQL 数据库
```

---

**当前状态**: ✅ 所有业务流程已实现，前后端完全对齐，可直接测试！

