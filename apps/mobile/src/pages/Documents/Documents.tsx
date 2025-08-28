import { Button, Empty, List, SearchBar, Spin } from 'antd-mobile'
import { AddOutline, DocumentOutline } from 'antd-mobile-icons'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'umi'

interface Document {
    id: string
    title: string
    type: 'doc' | 'sheet' | 'slide'
    lastModified: string
    size: string
    owner: string
}

const Documents: React.FC = () => {
    const [documents, setDocuments] = useState<Document[]>([])
    const [loading, setLoading] = useState(true)
    const [searchValue, setSearchValue] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        // 模拟加载文档数据
        setTimeout(() => {
            setDocuments([
                {
                    id: '1',
                    title: '项目需求文档',
                    type: 'doc',
                    lastModified: '2025-01-27 14:30',
                    size: '2.5MB',
                    owner: '张三'
                },
                {
                    id: '2',
                    title: '财务报表2024',
                    type: 'sheet',
                    lastModified: '2025-01-26 16:20',
                    size: '1.8MB',
                    owner: '李四'
                },
                {
                    id: '3',
                    title: '产品演示文稿',
                    type: 'slide',
                    lastModified: '2025-01-25 10:15',
                    size: '5.2MB',
                    owner: '王五'
                }
            ])
            setLoading(false)
        }, 1000)
    }, [])

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'doc':
                return '📄'
            case 'sheet':
                return '📊'
            case 'slide':
                return '📽️'
            default:
                return '📄'
        }
    }

    const getTypeText = (type: string) => {
        switch (type) {
            case 'doc':
                return '文档'
            case 'sheet':
                return '表格'
            case 'slide':
                return '演示'
            default:
                return '文档'
        }
    }

    const filteredDocuments = documents.filter(doc =>
        doc.title.toLowerCase().includes(searchValue.toLowerCase())
    )

    const handleCreateDocument = () => {
        // 创建新文档的逻辑
        console.log('创建新文档')
    }

    const handleDocumentClick = (doc: Document) => {
        // 打开文档的逻辑
        console.log('打开文档:', doc.title)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spin size="large" />
            </div>
        )
    }

    return (
        <div className="p-4 bg-gray-50 min-h-screen">
            {/* 头部搜索 */}
            <div className="mb-4">
                <SearchBar
                    placeholder="搜索文档..."
                    value={searchValue}
                    onChange={setSearchValue}
                    className="bg-white rounded-lg"
                />
            </div>

            {/* 创建按钮 */}
            <div className="mb-4">
                <Button
                    block
                    color="primary"
                    onClick={handleCreateDocument}
                    className="rounded-lg"
                >
                    <AddOutline className="mr-2" />
                    创建新文档
                </Button>
            </div>

            {/* 文档列表 */}
            {filteredDocuments.length > 0 ? (
                <List className="bg-white rounded-lg">
                    {filteredDocuments.map((doc) => (
                        <List.Item
                            key={doc.id}
                            onClick={() => handleDocumentClick(doc)}
                            arrow
                            className="border-b border-gray-100 last:border-b-0"
                        >
                            <div className="flex items-center">
                                <div className="text-2xl mr-3">
                                    {getTypeIcon(doc.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">{doc.title}</div>
                                    <div className="text-sm text-gray-500 mt-1">
                                        {getTypeText(doc.type)} • {doc.owner} • {doc.lastModified}
                                    </div>
                                </div>
                                <div className="text-xs text-gray-400">
                                    {doc.size}
                                </div>
                            </div>
                        </List.Item>
                    ))}
                </List>
            ) : (
                <Empty
                    description="暂无文档"
                    image={<DocumentOutline className="text-4xl text-gray-300" />}
                />
            )}
        </div>
    )
}

export default Documents
