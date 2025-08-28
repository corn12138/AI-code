import { history, useParams } from 'umi'
import { Card, NavBar } from 'antd-mobile'
import React from 'react'

const MessageDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>()

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <NavBar onBack={() => history.back()}>消息详情</NavBar>
            <div style={{ padding: 16 }}>
                <Card>
                    <h2>消息详情 #{id}</h2>
                    <p>这是一个消息详情页面...</p>
                </Card>
            </div>
        </div>
    )
}

export default MessageDetail
