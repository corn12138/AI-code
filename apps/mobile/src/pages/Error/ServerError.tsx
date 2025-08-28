import { Button, Result } from 'antd-mobile'
import { ExclamationCircleOutline } from 'antd-mobile-icons'
import React from 'react'
import { history } from 'umi'
import './Error.css'

const ServerError: React.FC = () => {
  const goHome = () => {
    history.push('/')
  }

  const refresh = () => {
    window.location.reload()
  }

  const goBack = () => {
    history.back()
  }

  return (
    <div className="error-container">
      <Result
        icon={<ExclamationCircleOutline style={{ fontSize: 64, color: '#ff6b35' }} />}
        status="error"
        title="服务器错误"
        description="抱歉，服务器出现了一些问题。请稍后重试或联系技术支持。"
      />

      <div className="error-actions">
        <Button color="primary" onClick={refresh} block>
          重新加载
        </Button>
        <Button fill="outline" onClick={goHome} block style={{ marginTop: 12 }}>
          返回首页
        </Button>
        <Button fill="none" onClick={goBack} block style={{ marginTop: 12 }}>
          返回上一页
        </Button>
      </div>
    </div>
  )
}

export default ServerError
