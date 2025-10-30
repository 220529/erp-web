import { RouterProvider } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { router } from './router'

dayjs.locale('zh-cn')

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <RouterProvider 
        router={router}
        future={{
          v7_startTransition: true,
        }}
      />
    </ConfigProvider>
  )
}

export default App

