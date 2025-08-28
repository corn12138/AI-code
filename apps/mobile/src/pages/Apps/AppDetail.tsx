import { Button, Card, NavBar, Space, Tag } from 'antd-mobile'
import React from 'react'
import { history, useParams } from 'umi'

const AppDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>()

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <NavBar onBack={() => history.back()}>应用详情</NavBar>
            <div style={{ padding: 16 }}>
                <Card>
                    <h2>应用详情 #{id}</h2>
                    <Space wrap>
                        <Tag color="primary">办公工具</Tag>
                        <Tag color="success">免费</Tag>
                    </Space>
                    <p style={{ marginTop: 16 }}>这是一个应用详情页面...</p>
                    <Button color="primary" block style={{ marginTop: 16 }}>
                        使用应用
                    </Button>
                </Card>
            </div>
        </div>
    )
}

export default AppDetail
