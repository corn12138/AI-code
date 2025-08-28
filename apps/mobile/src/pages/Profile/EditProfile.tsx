import { Button, Card, Form, Input, NavBar } from 'antd-mobile'
import React from 'react'
import { history } from 'umi'

const EditProfile: React.FC = () => {
    const [form] = Form.useForm()

    const handleSubmit = (values: any) => {
        console.log('Form values:', values)
        history.back()
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <NavBar onBack={() => history.back()}>编辑资料</NavBar>
            <div style={{ padding: 16 }}>
                <Card>
                    <Form form={form} onFinish={handleSubmit} layout="vertical">
                        <Form.Item name="nickname" label="昵称">
                            <Input placeholder="请输入昵称" />
                        </Form.Item>
                        <Form.Item name="email" label="邮箱">
                            <Input placeholder="请输入邮箱" />
                        </Form.Item>
                        <Form.Item name="phone" label="手机号">
                            <Input placeholder="请输入手机号" />
                        </Form.Item>
                        <Button type="submit" color="primary" block>
                            保存
                        </Button>
                    </Form>
                </Card>
            </div>
        </div>
    )
}

export default EditProfile
