import { Button, Result } from 'antd-mobile'
import { LockOutline } from 'antd-mobile-icons'
import React from 'react'
import { history } from 'umi'
import './Error.css'

const Forbidden: React.FC = () => {
    const goHome = () => {
        history.push('/')
    }

    const goBack = () => {
        history.back()
    }

    return (
        <div className="error-container">
            <Result
                icon={<LockOutline style={{ fontSize: 64, color: '#ff6b35' }} />}
                status="error"
                title="访问被拒绝"
                description="抱歉，您没有权限访问此页面。请联系管理员获取访问权限。"
            />

            <div className="error-actions">
                <Button color="primary" onClick={goHome} block>
                    返回首页
                </Button>
                <Button fill="outline" onClick={goBack} block style={{ marginTop: 12 }}>
                    返回上一页
                </Button>
            </div>
        </div>
    )
}

export default Forbidden
