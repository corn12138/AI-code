import { useTaskProcessStore } from '@/stores/taskProcessStore'
import { Button, NavBar } from 'antd-mobile'
import {
    LeftOutline,
    UserOutline
} from 'antd-mobile-icons'
import React, { useEffect, useState } from 'react'
import { history, useParams } from 'umi'
import './index.css'

interface SubProcessRecordProps { }

const SubProcessRecord: React.FC<SubProcessRecordProps> = () => {
    const { id } = useParams<{ id: string }>()
    const { state: { subProcessRecords, parentRecord }, clearSubProcessData } = useTaskProcessStore()
    const [expandedOpinions, setExpandedOpinions] = useState<string[]>([])

    // 获取子流程记录数据
    const subRecords = subProcessRecords || []

    // 组件卸载时清除数据
    useEffect(() => {
        return () => {
            clearSubProcessData()
        }
    }, [clearSubProcessData])

    const toggleOpinionExpand = (recordId: string) => {
        setExpandedOpinions(prev =>
            prev.includes(recordId)
                ? prev.filter(id => id !== recordId)
                : [...prev, recordId]
        )
    }

    const handleCopyOpinion = (opinion: string) => {
        navigator.clipboard.writeText(opinion).then(() => {
            // Toast.show('复制成功')
        }).catch(() => {
            // Toast.show('复制失败')
        })
    }

    // 渲染子流程时间线
    const renderSubTimeline = () => (
        <div className="timeline">
            {subRecords.map((record, index) => (
                <div key={record.id} className="timeline-item">
                    <div className="timeline-left">
                        <div className="timeline-dot"></div>
                        {index < subRecords.length - 1 && <div className="timeline-line" />}
                    </div>

                    <div className="timeline-content">
                        <div className="timeline-header">
                            <div className="timeline-action">
                                <span>{record.step}</span>
                            </div>
                        </div>

                        <div className="timeline-body">
                            <div className="handler-info">
                                <div className="handler-header">
                                    <div className="handler-left">
                                        <UserOutline className="handler-icon" />
                                        <span className="handler-name">{record.handler.name}</span>
                                        <span className="handler-id">{record.handler.userId}</span>
                                    </div>
                                    <div className="timeline-time">{record.handler.time}</div>
                                </div>
                                <div className="handler-department">{record.handler.department}</div>
                            </div>

                            {record.opinion && (
                                <div className="opinion-container">
                                    <div className="opinion-content">
                                        <div className="opinion-text">
                                            {expandedOpinions.includes(record.id) || record.opinion.length <= 20
                                                ? record.opinion
                                                : `${record.opinion.substring(0, 20)}...`
                                            }
                                        </div>
                                        <Button
                                            className="sub-copy-btn"
                                            onClick={() => handleCopyOpinion(record.opinion)}
                                        >
                                            📋
                                        </Button>
                                    </div>
                                    {record.opinion.length > 20 && (
                                        <Button
                                            className="sub-expand-opinion-btn"
                                            onClick={() => toggleOpinionExpand(record.id)}
                                        >
                                            {expandedOpinions.includes(record.id) ? '收起' : '展开'}
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )

    return (
        <div className="sub-process-record-page">
            <NavBar
                className="sub-process-record-nav"
                onBack={() => history.back()}
                backIcon={<LeftOutline />}
            >
                会办记录
            </NavBar>

            <div className="sub-process-record-content">
                {renderSubTimeline()}
            </div>
        </div>
    )
}

export default SubProcessRecord
