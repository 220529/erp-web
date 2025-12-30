import WujieReact from 'wujie-react'
import { useEffect } from 'react'
import { Spin } from 'antd'
import { useParams, useLocation } from 'react-router-dom'
import { getMicroAppByName, getMicroAppUrl, type MicroAppConfig } from '@/config/microApps'

interface MicroAppProps {
  name: string
  sync?: boolean
}

export default function MicroApp({ name, sync = true }: MicroAppProps) {
  const location = useLocation()
  const appConfig = getMicroAppByName(name)

  useEffect(() => {
    if (appConfig) {
      console.log(`[MicroApp] Loading ${name} from ${getMicroAppUrl(appConfig)}`)
    }
  }, [name, appConfig])

  if (!appConfig) {
    return <div style={{ padding: 24 }}>子应用 "{name}" 未配置</div>
  }

  const url = getMicroAppUrl(appConfig)
  // 将主应用的子路径传递给子应用
  const subPath = location.pathname.replace(appConfig.basePath, '') || '/'

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 64px)' }}>
      <WujieReact
        width="100%"
        height="100%"
        name={name}
        url={url + subPath}
        sync={sync}
        props={appConfig.props}
        loading={<Spin size="large" style={{ display: 'flex', justifyContent: 'center', paddingTop: 100 }} />}
      />
    </div>
  )
}
