import { loading } from '@/stores'
import { Avatar, Badge, Empty, InfiniteScroll, List, PullToRefresh, SearchBar, Tabs } from 'antd-mobile'
import { BellOutline, MessageOutline } from 'antd-mobile-icons'
import React, { useEffect, useState } from 'react'
import { history } from 'umi'
import './Message.css'

interface MessageItem {
  id: string
  type: 'chat' | 'system' | 'notification'
  title: string
  content: string
  avatar?: string
  time: string
  unreadCount?: number
  isRead: boolean
}

const Message: React.FC = () => {
  const [searchValue, setSearchValue] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [hasMore, setHasMore] = useState(true)
  // 消息数据状态

  // 模拟消息数据
  const mockMessages: MessageItem[] = [
    {
      id: '1',
      type: 'chat',
      title: '系统管理员',
      content: '欢迎使用移动工作台！如有任何问题请随时联系我们。',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      time: '刚刚',
      unreadCount: 1,
      isRead: false,
    },
    {
      id: '2',
      type: 'system',
      title: '系统通知',
      content: '您的账户安全设置已更新',
      time: '2分钟前',
      isRead: true,
    },
    {
      id: '3',
      type: 'notification',
      title: '应用更新',
      content: '移动工作台已更新到最新版本，快来体验新功能吧！',
      time: '1小时前',
      unreadCount: 2,
      isRead: false,
    },
    {
      id: '4',
      type: 'chat',
      title: '张三',
      content: '今天的会议改到下午3点了',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      time: '上午10:30',
      isRead: true,
    },
    {
      id: '5',
      type: 'system',
      title: '任务提醒',
      content: '您有3个待处理的任务即将到期',
      time: '昨天',
      unreadCount: 3,
      isRead: false,
    },
  ]

  useEffect(() => {
    loadMessages()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadMessages = async () => {
    try {
      console.log('Loading 对象:', loading)
      console.log('Loading.show 方法:', typeof loading.show)

      loading.show('加载消息中...')
      console.log('Loading.show 调用成功')

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMessages(mockMessages)
      console.log('消息加载完成')
    } catch (error) {
      console.error('Load messages failed:', error)
    } finally {
      loading.hide()
      console.log('Loading.hide 调用成功')
    }
  }

  const loadMore = async () => {
    try {
      // 模拟加载更多数据
      await new Promise(resolve => setTimeout(resolve, 1000))
      setHasMore(false)
    } catch (error) {
      console.error('Load more failed:', error)
    }
  }

  const handleRefresh = async () => {
    await loadMessages()
  }

  const handleMessageClick = (message: MessageItem) => {
    if (message.type === 'chat') {
      history.push(`/message/${message.id}`)
    } else {
      // 处理系统通知和其他类型消息
      console.log('Handle message:', message)
    }
  }

  const filteredMessages = messages.filter((message) => {
    const matchesSearch = message.title.toLowerCase().includes(searchValue.toLowerCase()) ||
      message.content.toLowerCase().includes(searchValue.toLowerCase())

    if (activeTab === 'all') return matchesSearch
    if (activeTab === 'unread') return matchesSearch && !message.isRead
    if (activeTab === 'chat') return matchesSearch && message.type === 'chat'
    if (activeTab === 'system') return matchesSearch && (message.type === 'system' || message.type === 'notification')

    return matchesSearch
  })

  const getMessageIcon = (type: MessageItem['type']) => {
    switch (type) {
      case 'chat':
        return <MessageOutline />
      case 'system':
      case 'notification':
        return <BellOutline />
      default:
        return <MessageOutline />
    }
  }

  const tabs = [
    { key: 'all', title: '全部' },
    { key: 'unread', title: '未读' },
    { key: 'chat', title: '聊天' },
    { key: 'system', title: '通知' },
  ]

  const renderMessage = (message: MessageItem) => (
    <List.Item
      key={message.id}
      prefix={
        message.avatar ? (
          <Avatar src={message.avatar} style={{ '--size': '48px' }} />
        ) : (
          <div className="message-icon">
            {getMessageIcon(message.type)}
          </div>
        )
      }
      extra={
        <div className="message-extra">
          <div className="message-time">{message.time}</div>
          {message.unreadCount && (
            <Badge content={message.unreadCount} style={{ '--right': '-2px', '--top': '2px' }} />
          )}
        </div>
      }
      onClick={() => handleMessageClick(message)}
      className={`message-item ${!message.isRead ? 'unread' : ''}`}
    >
      <div className="message-content">
        <div className="message-title">{message.title}</div>
        <div className="message-text">{message.content}</div>
      </div>
    </List.Item>
  )

  return (
    <div className="message-page">
      <div className="message-header">
        <SearchBar
          placeholder="搜索消息"
          value={searchValue}
          onChange={setSearchValue}
          style={{ '--border-radius': '20px' }}
        />
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        {tabs.map(tab => (
          <Tabs.Tab title={tab.title} key={tab.key} />
        ))}
      </Tabs>

      <div className="message-list">
        <PullToRefresh onRefresh={handleRefresh}>
          {filteredMessages.length > 0 ? (
            <List>
              {filteredMessages.map(renderMessage)}
            </List>
          ) : (
            <Empty
              description="暂无消息"
              image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
            />
          )}
          <InfiniteScroll loadMore={loadMore} hasMore={hasMore}>
            {hasMore ? '加载中...' : '没有更多了'}
          </InfiniteScroll>
        </PullToRefresh>
      </div>
    </div>
  )
}

export default Message