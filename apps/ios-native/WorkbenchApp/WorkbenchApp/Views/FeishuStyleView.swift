import SwiftUI

struct FeishuStyleView: View {
    @State private var workbenchItems: [WorkbenchItem] = []

    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // 背景色填充整个屏幕
                LinearGradient(
                    gradient: Gradient(colors: [Color(.systemBackground), Color(.systemGray6).opacity(0.3)]),
                    startPoint: .top,
                    endPoint: .bottom
                )
                .ignoresSafeArea(.all, edges: .all)
                
                ScrollView {
                    VStack(alignment: .leading, spacing: 24) {
                        // 欢迎区域
                        welcomeSection
                        
                        // 快速统计
                        statsSection

                        // 常用功能网格
                        functionGridSection

                        // 最近使用
                        recentSection
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 8)
                    .padding(.bottom, 100) // 为底部导航栏留出空间
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
                .ignoresSafeArea(.all, edges: .all)
            }
            .frame(width: geometry.size.width, height: geometry.size.height)
            .ignoresSafeArea(.all, edges: .all)
        }
        .ignoresSafeArea(.all, edges: .all)
        .navigationBarHidden(true)
        .onAppear {
            loadWorkbenchItems()
        }
    }

    // MARK: - 欢迎区域
    private var welcomeSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("早上好！")
                        .font(.title)
                        .compatibleFontWeight(.bold)
                        .foregroundColor(.primary)
                    
                    Text("今天也要加油工作哦")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                // 头像或图标
                Circle()
                    .fill(LinearGradient(
                        gradient: Gradient(colors: [.blue, .purple]),
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ))
                    .frame(width: 50, height: 50)
                    .overlay(
                        Image(systemName: "person.fill")
                            .foregroundColor(.white)
                            .compatibleSubtitle()
                    )
            }
        }
        .padding(.top, 20)
    }
    
    // MARK: - 统计区域
    private var statsSection: some View {
        HStack(spacing: 16) {
            StatCard(
                title: "今日待办",
                value: "5",
                color: .blue,
                icon: "checkmark.circle.fill"
            )
            
            StatCard(
                title: "本周会议",
                value: "3",
                color: .orange,
                icon: "video.fill"
            )
            
            StatCard(
                title: "未读消息",
                value: "12",
                color: .green,
                icon: "message.fill"
            )
        }
    }

    // MARK: - 功能网格区域
    private var functionGridSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("常用功能")
                    .compatibleTitle()
                    .compatibleFontWeight(.bold)
                    .foregroundColor(.primary)
                
                Spacer()
                
                Button("更多") {
                    // 显示更多功能
                }
                .font(.subheadline)
                .foregroundColor(.blue)
            }

            LazyVGrid(
                columns: Array(repeating: GridItem(.flexible(), spacing: 16), count: 4),
                spacing: 20
            ) {
                ForEach(workbenchItems.prefix(8)) { item in
                    ModernWorkbenchItemView(item: item) {
                        openH5Page(item)
                    }
                }
            }
        }
    }

    // MARK: - 最近使用区域
    private var recentSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("最近使用")
                    .compatibleTitle()
                    .compatibleFontWeight(.bold)
                    .foregroundColor(.primary)
                
                Spacer()
                
                Button("查看全部") {
                    // 显示所有最近使用的应用
                }
                .font(.subheadline)
                .foregroundColor(.blue)
            }

            VStack(spacing: 12) {
                ForEach(workbenchItems.prefix(4)) { item in
                    ModernRecentItemView(item: item) {
                        openH5Page(item)
                    }
                }
            }
        }
        .padding(.bottom, 20)
    }

    // MARK: - 数据加载
    private func loadWorkbenchItems() {
        workbenchItems = [
            WorkbenchItem(
                id: "documents",
                name: "文档",
                icon: "doc.text",
                color: .blue,
                url: "http://localhost:3001/api/mobile/docs",
                badge: 0,
                isNew: false
            ),
            WorkbenchItem(
                id: "checkin",
                name: "打卡",
                icon: "location.circle",
                color: .green,
                url: "http://localhost:3001/api/mobile/stats",
                badge: 0,
                isNew: false
            ),
            WorkbenchItem(
                id: "calendar",
                name: "日历",
                icon: "calendar",
                color: .purple,
                url: "http://localhost:3001/api/mobile/calendar",
                badge: 2,
                isNew: false
            ),
            WorkbenchItem(
                id: "chat",
                name: "聊天",
                icon: "message",
                color: .orange,
                url: "http://localhost:3001/api/mobile/chat",
                badge: 5,
                isNew: false
            ),
            WorkbenchItem(
                id: "tasks",
                name: "任务",
                icon: "checklist",
                color: .red,
                url: "http://localhost:3001/api/mobile/tasks",
                badge: 0,
                isNew: true
            ),
            WorkbenchItem(
                id: "meeting",
                name: "会议",
                icon: "video",
                color: .blue,
                url: "http://localhost:3001/api/mobile/meeting",
                badge: 0,
                isNew: false
            ),
            WorkbenchItem(
                id: "drive",
                name: "云盘",
                icon: "folder",
                color: .purple,
                url: "http://localhost:3001/api/mobile/drive",
                badge: 0,
                isNew: false
            ),
            WorkbenchItem(
                id: "approval",
                name: "审批",
                icon: "checkmark.seal",
                color: .pink,
                url: "http://localhost:3001/api/mobile/approval",
                badge: 3,
                isNew: false
            ),
            WorkbenchItem(
                id: "report",
                name: "报表",
                icon: "chart.bar",
                color: .orange,
                url: "http://localhost:3001/api/mobile/report",
                badge: 0,
                isNew: false
            ),
            WorkbenchItem(
                id: "hr",
                name: "人事",
                icon: "person.2",
                color: .green,
                url: "http://localhost:3001/api/mobile/hr",
                badge: 0,
                isNew: false
            ),
            WorkbenchItem(
                id: "finance",
                name: "财务",
                icon: "dollarsign.circle",
                color: .purple,
                url: "http://localhost:3001/api/mobile/finance",
                badge: 0,
                isNew: false
            ),
            WorkbenchItem(
                id: "settings",
                name: "设置",
                icon: "gearshape",
                color: .gray,
                url: "http://localhost:3001/api/mobile/settings",
                badge: 0,
                isNew: false
            ),
        ]
    }

    // MARK: - 打开H5页面
    private func openH5Page(_ item: WorkbenchItem) {
        print("打开页面: \(item.name) - \(item.url)")
        
        // 根据不同的功能项跳转到不同的页面
        switch item.id {
        case "documents":
            // 跳转到文档浏览页面 (Tab 1)
            NotificationCenter.default.post(
                name: NSNotification.Name("SwitchToTab"),
                object: nil,
                userInfo: ["tabIndex": 1]
            )
        case "chat", "meeting", "tasks", "approval", "report", "hr", "finance":
            // 跳转到移动端应用页面 (Tab 2)
            NotificationCenter.default.post(
                name: NSNotification.Name("SwitchToTab"),
                object: nil,
                userInfo: ["tabIndex": 2]
            )
        default:
            // 其他功能暂时显示提示
            print("功能开发中: \(item.name)")
        }
    }
}

// MARK: - 统计卡片
struct StatCard: View {
    let title: String
    let value: String
    let color: Color
    let icon: String
    
    var body: some View {
        VStack(spacing: 8) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(color)
                    .compatibleSubtitle()
                
                Spacer()
                
                Text(value)
                    .compatibleTitle()
                    .compatibleFontWeight(.bold)
                    .foregroundColor(color)
            }
            
            HStack {
                    Text(title)
                        .compatibleCaption()
                        .foregroundColor(.secondary)
                
                Spacer()
            }
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color(.systemBackground))
                .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 2)
        )
    }
}

// MARK: - 现代化工作台项目视图
struct ModernWorkbenchItemView: View {
    let item: WorkbenchItem
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            VStack(spacing: 8) {
                ZStack {
                    // 背景圆形
                    Circle()
                        .fill(
                            LinearGradient(
                                gradient: Gradient(colors: [item.color.opacity(0.1), item.color.opacity(0.05)]),
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 56, height: 56)
                        .overlay(
                            Circle()
                                .stroke(item.color.opacity(0.2), lineWidth: 1)
                        )

                    // 图标
                    Image(systemName: item.icon)
                        .compatibleSubtitle()
                        .foregroundColor(item.color)
                        .compatibleFontWeight(.medium)

                    // 新功能标识
                    if item.isNew {
                        Circle()
                            .fill(.red)
                            .frame(width: 8, height: 8)
                            .offset(x: 20, y: -20)
                    }

                    // 未读消息数量
                        if item.badge > 0 {
                            Text(item.badge > 99 ? "99+" : "\(item.badge)")
                                .compatibleCaption()
                                .compatibleFontWeight(.semibold)
                                .foregroundColor(.white)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(
                                    Capsule()
                                        .fill(.red)
                                )
                                .offset(x: 20, y: -20)
                        }
                }

                        Text(item.name)
                            .compatibleCaption()
                            .compatibleFontWeight(.medium)
                            .foregroundColor(.primary)
                            .multilineTextAlignment(.center)
                            .lineLimit(1)
            }
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - 现代化最近使用项目视图
struct ModernRecentItemView: View {
    let item: WorkbenchItem
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 16) {
                // 图标区域
                ZStack {
                    RoundedRectangle(cornerRadius: 10)
                        .fill(
                            LinearGradient(
                                gradient: Gradient(colors: [item.color.opacity(0.1), item.color.opacity(0.05)]),
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 48, height: 48)
                        .overlay(
                            RoundedRectangle(cornerRadius: 10)
                                .stroke(item.color.opacity(0.2), lineWidth: 1)
                        )

                    Image(systemName: item.icon)
                        .compatibleSubtitle()
                        .foregroundColor(item.color)
                        .compatibleFontWeight(.medium)
                }

                // 内容区域
                        VStack(alignment: .leading, spacing: 4) {
                            Text(item.name)
                                .font(.subheadline)
                                .compatibleFontWeight(.medium)
                                .foregroundColor(.primary)

                            Text("最近使用")
                                .compatibleCaption()
                                .foregroundColor(.secondary)
                        }

                Spacer()

                // 右侧信息
                VStack(alignment: .trailing, spacing: 4) {
                        if item.badge > 0 {
                            Text("\(item.badge)")
                                .compatibleCaption()
                                .compatibleFontWeight(.semibold)
                                .foregroundColor(.white)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(
                                    Capsule()
                                        .fill(.red)
                                )
                        }

                    Image(systemName: "chevron.right")
                        .compatibleCaption()
                        .foregroundColor(.secondary)
                }
            }
            .padding(16)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color(.systemBackground))
                    .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 2)
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - 工作台项目视图
struct WorkbenchItemView: View {
    let item: WorkbenchItem
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            VStack(spacing: 8) {
                ZStack {
                    Circle()
                        .fill(item.color.opacity(0.1))
                        .frame(width: 48, height: 48)

                    Image(systemName: item.icon)
                        .compatibleTitle()
                        .foregroundColor(item.color)

                    // 新功能标识
                    if item.isNew {
                        Circle()
                            .fill(.red)
                            .frame(width: 8, height: 8)
                            .offset(x: 16, y: -16)
                    }

                    // 未读消息数量
                    if item.badge > 0 {
                        Text(item.badge > 99 ? "99+" : "\(item.badge)")
                            .compatibleCaption()
                            .foregroundColor(.white)
                            .padding(.horizontal, 4)
                            .padding(.vertical, 2)
                            .background(Color.red)
                            .clipShape(Capsule())
                            .offset(x: 16, y: -16)
                    }
                }

                Text(item.name)
                    .font(.caption)
                    .foregroundColor(.primary)
                    .multilineTextAlignment(.center)
            }
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - 最近使用项目视图
struct RecentItemView: View {
    let item: WorkbenchItem
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 12) {
                ZStack {
                    Circle()
                        .fill(item.color.opacity(0.1))
                        .frame(width: 40, height: 40)

                    Image(systemName: item.icon)
                        .compatibleSubtitle()
                        .foregroundColor(item.color)
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text(item.name)
                        .font(.subheadline)
                        .foregroundColor(.primary)

                    Text("最近使用")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Spacer()

                if item.badge > 0 {
                    Text("\(item.badge)")
                        .font(.caption)
                        .foregroundColor(.white)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color.red)
                        .clipShape(Capsule())
                }

                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding()
            .background(Color.white)
            .cornerRadius(12)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - 数据模型
struct WorkbenchItem: Identifiable {
    let id: String
    let name: String
    let icon: String
    let color: Color
    let url: String
    let badge: Int
    let isNew: Bool
}

struct FeishuStyleView_Previews: PreviewProvider {
    static var previews: some View {
        FeishuStyleView()
    }
}
