# 产品套餐管理功能总结

## ✅ 已完成的功能

### 1️⃣ 产品套餐列表页面
**路径**: `/product`  
**文件**: `packages/main/src/features/product/List.tsx`

#### 功能清单
- ✅ 套餐列表展示（编码、名称、成本、售价、物料数、状态）
- ✅ 搜索筛选（关键词、状态）
- ✅ 新增套餐（名称、售价、描述等）
- ✅ 编辑套餐
- ✅ 删除套餐
- ✅ 查看物料清单（详情弹窗）
- ✅ **套餐编码自动生成**（前端不需输入）

#### 已优化的表单字段
```typescript
{
  name: string,        // 必填：套餐名称
  cost Price?: number,   // 可选：成本价（可由物料自动计算）
  salePrice?: number,  // 可选：售价
  description?: string, // 可选：套餐描述
  status?: string,     // 可选：状态（默认 active）
  sort?: number,       // 可选：排序
  remark?: string      // 可选：备注
}
```

**注意**: 
- ❌ 不再传递 `code` 字段（后端自动生成 CP 前缀）
- 成本价和售价都改为可选，可以后续通过物料清单计算

---

### 2️⃣ 物料清单查看
**位置**: 产品列表页 → 详情弹窗

#### 功能
- ✅ 查看套餐包含的所有物料
- ✅ 显示物料名称、类别、数量、单位、单价、小计
- ✅ 自动计算总成本

#### 物料清单字段
| 字段 | 类型 | 说明 |
|------|------|------|
| materialName | string | 物料名称 |
| category | main/auxiliary/labor | 物料类别 |
| quantity | number | 数量 |
| unit | string | 单位 |
| price | number | 单价 |
| amount | number | 小计（自动计算） |

---

## 📋 待实现的功能（推荐扩展）

### 3️⃣ 物料管理页面（独立页面）
**建议路径**: `/product/:id/materials`

#### 页面布局
```
┌─────────────────────────────────────────────────┐
│ ← 返回  |  现代简约三居室套餐 (CP0001)            │
│ 成本: ¥45,000 | 售价: ¥80,000 | 利润: ¥35,000   │
├─────────────────────────────────────────────────┤
│ [+ 添加物料]                                      │
├─────────────────────────────────────────────────┤
│ □ 物料名称      类别  数量  单位  单价    小计    │
│ □ 东鹏瓷砖      主材   50   ㎡   80.00  4,000.00 │
│                                   [编辑] [删除]   │
│ □ 水泥         辅材   20   袋   25.00    500.00 │
│                                   [编辑] [删除]   │
├─────────────────────────────────────────────────┤
│ 总成本: ¥45,000 | 物料数: 15个                   │
└─────────────────────────────────────────────────┘
```

#### 需要实现的接口调用
```typescript
// 添加物料
POST /api/products/:id/materials
{
  "materialId": 5,
  "quantity": 50,
  "price": 80,
  "unit": "㎡"
}

// 更新物料
PUT /api/products/materials/:id
{
  "quantity": 60,
  "price": 85
}

// 删除物料
DELETE /api/products/materials/:id
```

---

## 📡 可用的后端接口

### 产品套餐基础接口
| 方法 | 路径 | 说明 | 状态 |
|------|------|------|------|
| GET | `/api/products` | 查询套餐列表 | ✅ 已对接 |
| GET | `/api/products/:id` | 查询套餐详情 | ✅ 已对接 |
| POST | `/api/products` | 创建套餐 | ✅ 已对接 |
| PUT | `/api/products/:id` | 更新套餐 | ✅ 已对接 |
| DELETE | `/api/products/:id` | 删除套餐 | ✅ 已对接 |

### 产品物料管理接口
| 方法 | 路径 | 说明 | 状态 |
|------|------|------|------|
| GET | `/api/products/:id/materials` | 获取套餐的物料清单 | ✅ 已对接 |
| POST | `/api/products/:id/materials` | 为套餐添加物料 | ⏳ 待实现前端 |
| PUT | `/api/products/materials/:id` | 更新物料信息 | ⏳ 待实现前端 |
| DELETE | `/api/products/materials/:id` | 删除物料 | ⏳ 待实现前端 |

---

## 🎯 业务流程说明

### 管理员配置套餐流程
```
1. 进入"套餐管理"页面
2. 点击"新增套餐"
3. 填写套餐基本信息
   - 套餐名称（必填）
   - 售价（可选）
   - 套餐描述（可选）
4. 保存套餐
5. （可选）进入物料管理页面
   - 添加物料
   - 设置数量和单价
   - 系统自动计算成本
6. 套餐配置完成
```

### 客户下单流程
```
1. 客户管理 → 客户详情
2. 点击"转订单"
3. 选择产品套餐
4. 调用业务流程：order_create_from_product
5. 订单自动包含套餐中的所有物料
6. 可以在订单详情页继续调整物料
```

---

## 🔧 如何扩展物料管理功能

### 方案A：创建独立的物料管理页面（推荐）

**优点**：
- 更好的用户体验
- 可以批量操作
- 独立的路由，便于分享链接

**实现步骤**：
1. 创建 `ProductMaterials.tsx` 组件
2. 添加路由：`/product/:id/materials`
3. 在产品列表增加"管理物料"按钮
4. 实现添加、编辑、删除物料功能

**示例代码**：
```typescript
// packages/main/src/features/product/Materials.tsx
import { useParams } from 'react-router-dom'

export default function ProductMaterials() {
  const { id } = useParams<{ id: string }>()
  
  // 1. 加载套餐信息
  // 2. 加载物料清单
  // 3. 实现添加物料（弹窗选择物料）
  // 4. 实现编辑物料（修改数量、单价）
  // 5. 实现删除物料
  
  return (
    <div>
      {/* 套餐信息卡片 */}
      {/* 添加物料按钮 */}
      {/* 物料清单表格 */}
      {/* 添加物料弹窗 */}
      {/* 编辑物料弹窗 */}
    </div>
  )
}
```

### 方案B：增强详情弹窗功能

**优点**：
- 实现简单
- 不需要新增路由

**缺点**：
- 弹窗中操作体验较差
- 功能有限

---

## 📝 API 调用示例

### 创建套餐
```typescript
const data = {
  name: "现代简约三居室套餐",
  salePrice: 80000,
  description: "适合90-120平米三居室",
  status: "active"
}

await productApi.createProduct(data)
```

### 添加物料到套餐
```typescript
// 需要在 product.ts 中添加接口
export async function addProductMaterial(
  productId: number, 
  data: {
    materialId: number
    quantity: number
    price: number
    unit?: string
  }
): Promise<ProductMaterial> {
  return request.post(`/api/products/${productId}/materials`, data)
}

// 调用
await productApi.addProductMaterial(1, {
  materialId: 5,
  quantity: 50,
  price: 80,
  unit: "㎡"
})
```

---

## ⚠️ 注意事项

### 1. 数据一致性
- ✅ 套餐编码由后端自动生成（CP前缀）
- ✅ 成本价可以根据物料清单自动计算
- ✅ 删除套餐前，检查是否有订单正在使用

### 2. 用户体验
- ✅ 物料选择器支持搜索
- ✅ 自动计算小计金额
- ✅ 删除操作需要二次确认

### 3. 性能优化
- ✅ 物料清单使用分页（物料多时）
- ✅ 物料选择器懒加载

---

## 🚀 下一步计划

### 立即可用
1. ✅ 套餐列表查询
2. ✅ 套餐新增/编辑/删除
3. ✅ 查看物料清单

### 推荐扩展
4. ⏳ 独立的物料管理页面
5. ⏳ 批量导入物料
6. ⏳ 套餐复制功能
7. ⏳ 物料使用统计

---

**当前状态**: ✅ 产品套餐基础管理功能已完成，可正常使用

