import {
    ActionSheet,
    Button,
    Checkbox,
    Empty,
    NavBar,
    Toast
} from 'antd-mobile'
import {
    DownOutline,
    LeftOutline
} from 'antd-mobile-icons'
import React, { useCallback, useEffect, useState } from 'react'
import { history, useLocation } from 'umi'
import './index.css'

interface FileItem {
    id: string
    name: string
    type: 'word' | 'excel' | 'pdf' | 'image' | 'other'
    size: string
    status: 'pending' | 'electronic' | 'archive' | 'manual' | 'marked'
    modifyTime: string
    serialNumber: string
    legalId: string
    documentNumber: string
    printCount: number
}

interface TaskFileData {
    fileType: 'template' | 'attachment'
    files: FileItem[]
    taskId?: string
    taskTitle?: string
}

interface FileListProps {
    fileType?: 'template' | 'attachment'
    files?: FileItem[]
}

const FileList: React.FC<FileListProps> = ({
    fileType: propFileType,
    files: propFiles
}) => {
    const location = useLocation()
    const [fileType, setFileType] = useState<'template' | 'attachment'>('template')
    const [files, setFiles] = useState<FileItem[]>([])
    const [taskInfo, setTaskInfo] = useState<{ taskId?: string, taskTitle?: string }>({})
    const [selectedFiles, setSelectedFiles] = useState<string[]>([])
    const [expandedFiles, setExpandedFiles] = useState<string[]>([])
    const [showActions, setShowActions] = useState(false)

    // 初始化数据
    useEffect(() => {
        console.log('🗂️ FileList 初始化，获取文件数据', { location, propFileType, propFiles })

        // 优先从路由状态获取数据
        const routeState = location.state as TaskFileData | undefined
        if (routeState) {
            console.log('📋 从路由状态获取文件数据:', routeState)
            setFileType(routeState.fileType)
            setFiles(routeState.files || [])
            setTaskInfo({
                taskId: routeState.taskId,
                taskTitle: routeState.taskTitle
            })
        } else {
            // 回退到URL参数和props
            const urlParams = new URLSearchParams(location.search)
            const urlFileType = urlParams.get('type') as 'template' | 'attachment'

            if (urlFileType) {
                setFileType(urlFileType)
                console.log('📋 从URL参数获取文件类型:', urlFileType)
            } else if (propFileType) {
                setFileType(propFileType)
                console.log('📋 从props获取文件类型:', propFileType)
            }

            if (propFiles) {
                setFiles(propFiles)
                console.log('📋 从props获取文件列表:', propFiles)
            }
        }
    }, [location, propFileType, propFiles])

    const handleSelectAll = useCallback(() => {
        if (selectedFiles.length === files.length) {
            setSelectedFiles([])
        } else {
            setSelectedFiles(files.map(f => f.id))
        }
    }, [selectedFiles, files])

    const handleSelectFile = useCallback((fileId: string) => {
        setSelectedFiles(prev =>
            prev.includes(fileId)
                ? prev.filter(id => id !== fileId)
                : [...prev, fileId]
        )
    }, [])

    const toggleFileExpand = useCallback((fileId: string) => {
        setExpandedFiles(prev =>
            prev.includes(fileId)
                ? prev.filter(id => id !== fileId)
                : [...prev, fileId]
        )
    }, [])

    const handleOperation = () => {
        if (selectedFiles.length === 0) {
            Toast.show('请先选择文件')
            return
        }
        setShowActions(true)
    }

    const handleView = () => {
        Toast.show(`查看 ${selectedFiles.length} 个文件`)
        setShowActions(false)
    }

    const handleDownload = () => {
        Toast.show(`下载 ${selectedFiles.length} 个文件`)
        setShowActions(false)
    }

    const getFileIcon = (type: FileItem['type']) => {
        const iconMap = {
            word: '📄',
            excel: '📊',
            pdf: '📕',
            image: '🖼️',
            other: '📋'
        }
        return iconMap[type] || '📋'
    }

    const getStatusText = (status: FileItem['status']) => {
        const statusMap = {
            pending: '待用印',
            electronic: '电子用印',
            archive: '推至数字档案',
            manual: '手工印印确认',
            marked: '标记不印印'
        }
        return statusMap[status] || status
    }

    const renderFileItem = (file: FileItem) => {
        const isSelected = selectedFiles.includes(file.id)
        const isExpanded = expandedFiles.includes(file.id)

        return (
            <div key={file.id} className="file-item">
                <div className={`file-header ${isExpanded ? 'expanded' : ''}`}>
                    <Checkbox
                        className="file-checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectFile(file.id)}
                    />
                    <div className={`file-icon ${file.type}`}>
                        {getFileIcon(file.type)}
                    </div>
                    <div className="file-info">
                        <div className="file-name">{file.name}</div>
                        <div className="file-meta">
                            <span className="file-type">{file.type === 'other' ? '其他' : file.type}</span>
                            <span className="file-size">{file.size}MB</span>
                        </div>
                    </div>
                    <Button
                        className="expand-button"
                        onClick={() => toggleFileExpand(file.id)}
                    >
                        <DownOutline className={`expand-icon ${isExpanded ? 'expanded' : ''}`} />
                    </Button>
                </div>
                {isExpanded && (
                    <div className="file-details">
                        <div className="detail-grid">
                            <div className="detail-row">
                                <span className="detail-label">类型</span>
                                <span className="detail-value">{file.type === 'other' ? '其他' : file.type}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">份数</span>
                                <span className="detail-value">{Math.floor(Math.random() * 20 + 1)}</span>
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
                                <span className="detail-value highlight">{file.serialNumber}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">状态</span>
                                <span className={`detail-value status-${file.status}`}>
                                    {getStatusText(file.status)}
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">文本修改时间</span>
                                <span className="detail-value">{file.modifyTime}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">用印说明</span>
                                <span className="detail-value">{Math.floor(Math.random() * 20 + 1)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="file-list-page">
            <NavBar
                className="file-list-nav"
                onBack={() => {
                    console.log('🔙 文件列表页返回按钮点击')
                    try {
                        history.back()
                    } catch (error) {
                        console.error('返回失败，使用备用方案:', error)
                        if (taskInfo.taskId) {
                            history.push(`/task-process/detail/${taskInfo.taskId}`)
                        } else {
                            history.push('/task-process')
                        }
                    }
                }}
                backIcon={<LeftOutline />}
            >
                {fileType === 'template' ? '用印文本列表' : '附件列表'}
            </NavBar>

            <div className="file-list-content">
                {files.length === 0 ? (
                    <Empty
                        className="empty-file-list"
                        description="暂无文件"
                        imageStyle={{ width: 64, height: 64 }}
                    />
                ) : (
                    files.map(renderFileItem)
                )}
            </div>

            <div className="file-list-footer">
                <div className="footer-left">
                    <Button
                        className="select-all-btn"
                        onClick={handleSelectAll}
                    >
                        {selectedFiles.length === files.length ? '取消' : '全选'}
                    </Button>
                    <span className="selected-count">
                        已选择 <span className="count">{selectedFiles.length}</span> 个
                    </span>
                </div>
                <Button
                    className="operation-btn"
                    color="primary"
                    disabled={selectedFiles.length === 0}
                    onClick={handleOperation}
                >
                    操作
                </Button>
            </div>

            {/* 操作弹窗 - 参考ui12.jpg，只保留查看和下载 */}
            <ActionSheet
                visible={showActions}
                actions={[
                    {
                        text: '查看',
                        key: 'view',
                        style: { color: '#333333' }
                    },
                    {
                        text: '下载',
                        key: 'download',
                        style: { color: '#333333' }
                    }
                ]}
                cancelText="取消"
                onClose={() => setShowActions(false)}
                onAction={(action) => {
                    if (action.key === 'view') {
                        handleView()
                    } else if (action.key === 'download') {
                        handleDownload()
                    }
                }}
            />
        </div>
    )
}

export default FileList