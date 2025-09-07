/**
 * 文件列表页面
 * 参考ui8.jpg的设计，支持选择、展开、操作等功能
 */

import {
    ActionSheet,
    Button,
    Card,
    Checkbox,
    NavBar,
    Toast
} from 'antd-mobile'
import {
    DownOutline,
    FileOutline,
    LeftOutline,
    UpOutline
} from 'antd-mobile-icons'
import React, { useState } from 'react'
import { history } from 'umi'
import './index.css'

// 文件信息接口
interface FileInfo {
    id: string
    name: string
    type: string
    size: string
    status: string
    modifyTime: string
    serialNumber?: string
    legalId?: string
    documentNumber?: string
    printCount?: number
}

// 模拟文件数据
const mockFiles: FileInfo[] = [
    {
        id: '1',
        name: '远程办公VPN申请手册手...word',
        type: '其他',
        size: '12',
        status: '待用印',
        modifyTime: '2023-10-10 10:00:00',
        printCount: 12,
        serialNumber: 'SLCM202311090008',
        legalId: '取消编号',
        documentNumber: '——'
    },
    {
        id: '2',
        name: '远程办公VPN申请手册.excel',
        type: 'excel',
        size: '8',
        status: '待用印',
        modifyTime: '2023-10-10 10:00:00',
        printCount: 8
    },
    {
        id: '3',
        name: '远程办公VPN申请手册.pdf',
        type: 'pdf',
        size: '15',
        status: '电子用印',
        modifyTime: '2023-10-10 10:00:00'
    },
    {
        id: '4',
        name: '远程办公VPN申请手册.excel',
        type: 'excel',
        size: '12',
        status: '推至数字档案',
        modifyTime: '2023-10-10 10:00:00'
    },
    {
        id: '5',
        name: '远程办公VPN申请手册手...word',
        type: 'word',
        size: '10',
        status: '手工印印确认',
        modifyTime: '2023-10-10 10:00:00'
    },
    {
        id: '6',
        name: '远程办公VPN申请手册',
        type: 'other',
        size: '5',
        status: '标记不用印',
        modifyTime: '2023-10-10 10:00:00'
    }
]

interface FileListProps {
    fileType?: 'template' | 'attachment'
    files?: string[]
}

const FileList: React.FC<FileListProps> = ({
    fileType: propFileType,
    files: propFiles
}) => {
    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
    const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set())
    const [showActionSheet, setShowActionSheet] = useState(false)
    const [fileType, setFileType] = useState<'template' | 'attachment'>('template')
    const [files, setFiles] = useState<string[]>([])

    // 从URL参数获取文件类型和文件列表
    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const typeParam = urlParams.get('type') as 'template' | 'attachment'
        const filesParam = urlParams.get('files')

        if (typeParam) {
            setFileType(typeParam)
        } else if (propFileType) {
            setFileType(propFileType)
        }

        if (filesParam) {
            try {
                const parsedFiles = JSON.parse(filesParam)
                setFiles(parsedFiles)
            } catch (error) {
                console.error('解析文件列表失败:', error)
            }
        } else if (propFiles) {
            setFiles(propFiles)
        }
    }, [propFileType, propFiles])

    // 全选/取消全选
    const handleSelectAll = () => {
        if (selectedFiles.size === mockFiles.length) {
            setSelectedFiles(new Set())
        } else {
            setSelectedFiles(new Set(mockFiles.map(file => file.id)))
        }
    }

    // 选择单个文件
    const handleSelectFile = (fileId: string) => {
        const newSelected = new Set(selectedFiles)
        if (newSelected.has(fileId)) {
            newSelected.delete(fileId)
        } else {
            newSelected.add(fileId)
        }
        setSelectedFiles(newSelected)
    }

    // 展开/收起文件详情
    const toggleFileExpand = (fileId: string) => {
        const newExpanded = new Set(expandedFiles)
        if (newExpanded.has(fileId)) {
            newExpanded.delete(fileId)
        } else {
            newExpanded.add(fileId)
        }
        setExpandedFiles(newExpanded)
    }

    // 文件操作
    const handleFileOperation = (operation: 'view' | 'download') => {
        const selectedCount = selectedFiles.size
        if (selectedCount === 0) {
            Toast.show({
                content: '请先选择文件',
                icon: 'fail'
            })
            return
        }

        const operationText = operation === 'view' ? '查看' : '下载'
        Toast.show({
            content: `${operationText}${selectedCount}个文件`,
            icon: 'success'
        })

        // 这里实现具体的查看或下载逻辑
        console.log(`${operationText}文件:`, Array.from(selectedFiles))
        setShowActionSheet(false)
    }

    // 获取文件类型图标颜色
    const getFileTypeColor = (type: string) => {
        switch (type.toLowerCase()) {
            case 'word':
                return '#1890ff'
            case 'excel':
                return '#52c41a'
            case 'pdf':
                return '#f5222d'
            default:
                return '#666'
        }
    }

    // 渲染文件项
    const renderFileItem = (file: FileInfo) => {
        const isSelected = selectedFiles.has(file.id)
        const isExpanded = expandedFiles.has(file.id)

        return (
            <Card key={file.id} className="file-item-card">
                <div className="file-item-header">
                    <div className="file-checkbox">
                        <Checkbox
                            checked={isSelected}
                            onChange={() => handleSelectFile(file.id)}
                        />
                    </div>
                    <div className="file-icon">
                        <FileOutline
                            style={{
                                color: getFileTypeColor(file.type),
                                fontSize: '24px'
                            }}
                        />
                    </div>
                    <div className="file-basic-info">
                        <div className="file-name">{file.name}</div>
                        <div className="file-meta">
                            <span className="file-type">{file.type}</span>
                            <span className="file-size">{file.size}</span>
                        </div>
                    </div>
                    <div className="file-expand-btn">
                        <Button
                            fill="none"
                            size="small"
                            onClick={() => toggleFileExpand(file.id)}
                        >
                            {isExpanded ? <UpOutline /> : <DownOutline />}
                        </Button>
                    </div>
                </div>

                {/* 展开的详细信息 */}
                {isExpanded && (
                    <div className="file-detail-info">
                        <div className="detail-row">
                            <span className="detail-label">类型</span>
                            <span className="detail-value">{file.type}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">份数</span>
                            <span className="detail-value">{file.size}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">法审情况</span>
                            <span className="detail-value">——</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">法审ID</span>
                            <span className="detail-value">——</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">文本编号</span>
                            <span className="detail-value">{file.serialNumber || '——'}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">状态</span>
                            <span className="detail-value">{file.status}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">文本修改时间</span>
                            <span className="detail-value">{file.modifyTime}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">用印说明</span>
                            <span className="detail-value">{file.printCount || '——'}</span>
                        </div>
                    </div>
                )}
            </Card>
        )
    }

    return (
        <div className="file-list-page">
            {/* 导航栏 */}
            <NavBar
                className="file-list-nav"
                onBack={() => history.back()}
                backIcon={<LeftOutline />}
            >
                {fileType === 'template' ? '目录模板' : '附件列表'}
            </NavBar>

            {/* 文件列表 */}
            <div className="file-list-content">
                {mockFiles.map(renderFileItem)}
            </div>

            {/* 底部操作栏 */}
            <div className="file-list-footer">
                <div className="footer-left">
                    <Button
                        fill="none"
                        size="small"
                        onClick={handleSelectAll}
                    >
                        全选
                    </Button>
                    <span className="selected-count">
                        已选择 {selectedFiles.size} 个
                    </span>
                </div>
                <div className="footer-right">
                    <Button
                        color="primary"
                        onClick={() => setShowActionSheet(true)}
                        disabled={selectedFiles.size === 0}
                    >
                        操作
                    </Button>
                </div>
            </div>

            {/* 操作菜单 */}
            <ActionSheet
                visible={showActionSheet}
                onClose={() => setShowActionSheet(false)}
                actions={[
                    {
                        key: 'view',
                        text: '查看',
                        onClick: () => handleFileOperation('view')
                    },
                    {
                        key: 'download',
                        text: '下载',
                        onClick: () => handleFileOperation('download')
                    }
                ]}
                cancelText="取消"
            />
        </div>
    )
}

export default FileList
