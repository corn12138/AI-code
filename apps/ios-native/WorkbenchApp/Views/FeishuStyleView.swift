import SwiftUI

struct FeishuStyleView: View {
    @State private var workbenchItems: [WorkbenchItem] = []

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // 头部信息
                    headerSection

                    // 常用功能网格
                    functionGridSection

                    // 最近使用
                    recentSection
                }
                .padding(.horizontal, 16)
            }
            .background(Color.gray.opacity(0.1))
            .navigationTitle("工作台")
            .navigationBarTitleDisplayMode(.large)
        }
        .onAppear {
            loadWorkbenchItems()
        }
    }

    // MARK: - 头部区域
    private var headerSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("高效办公，从这里开始")
                .font(.subheadline)
                .foregroundColor(.secondary)

            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("今日待办")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text("5")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.blue)
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 4) {
                    Text("本周会议")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text("3")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.orange)
                }
            }
            .padding()
            .background(Color.white)
            .cornerRadius(12)
        }
    }

    // MARK: - 功能网格区域
    private var functionGridSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("常用功能")
                .font(.headline)
                .fontWeight(.semibold)

            LazyVGrid(
                columns: Array(repeating: GridItem(.flexible(), spacing: 12), count: 4), spacing: 16
            ) {
                ForEach(workbenchItems) { item in
                    WorkbenchItemView(item: item) {
                        openH5Page(item)
                    }
                }
            }
        }
    }

    // MARK: - 最近使用区域
    private var recentSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("最近使用")
                .font(.headline)
                .fontWeight(.semibold)

            VStack(spacing: 8) {
                ForEach(workbenchItems.prefix(3)) { item in
                    RecentItemView(item: item) {
                        openH5Page(item)
                    }
                }
            }
        }
    }

    // MARK: - 数据加载
    private func loadWorkbenchItems() {
        workbenchItems = [
            WorkbenchItem(
                id: "documents",
                name: "文档",
                icon: "doc.text",
                color: .blue,
                url: "http://localhost:8002/documents",
                badge: 0,
                isNew: false
            ),
            WorkbenchItem(
                id: "checkin",
                name: "打卡",
                icon: "location.circle",
                color: .green,
                url: "http://localhost:8002/checkin",
                badge: 0,
                isNew: false
            ),
            WorkbenchItem(
                id: "calendar",
                name: "日历",
                icon: "calendar",
                color: .purple,
                url: "http://localhost:8002/calendar",
                badge: 2,
                isNew: false
            ),
            WorkbenchItem(
                id: "chat",
                name: "聊天",
                icon: "message",
                color: .orange,
                url: "http://localhost:8002/chat",
                badge: 5,
                isNew: false
            ),
            WorkbenchItem(
                id: "tasks",
                name: "任务",
                icon: "checklist",
                color: .red,
                url: "http://localhost:8002/tasks",
                badge: 0,
                isNew: true
            ),
            WorkbenchItem(
                id: "meeting",
                name: "会议",
                icon: "video",
                color: .teal,
                url: "http://localhost:8002/meeting",
                badge: 0,
                isNew: false
            ),
            WorkbenchItem(
                id: "drive",
                name: "云盘",
                icon: "folder",
                color: .indigo,
                url: "http://localhost:8002/drive",
                badge: 0,
                isNew: false
            ),
            WorkbenchItem(
                id: "approval",
                name: "审批",
                icon: "checkmark.seal",
                color: .pink,
                url: "http://localhost:8002/approval",
                badge: 3,
                isNew: false
            ),
            WorkbenchItem(
                id: "report",
                name: "报表",
                icon: "chart.bar",
                color: .brown,
                url: "http://localhost:8002/report",
                badge: 0,
                isNew: false
            ),
            WorkbenchItem(
                id: "hr",
                name: "人事",
                icon: "person.2",
                color: .mint,
                url: "http://localhost:8002/hr",
                badge: 0,
                isNew: false
            ),
            WorkbenchItem(
                id: "finance",
                name: "财务",
                icon: "dollarsign.circle",
                color: .purple,
                url: "http://localhost:8002/finance",
                badge: 0,
                isNew: false
            ),
            WorkbenchItem(
                id: "settings",
                name: "设置",
                icon: "gearshape",
                color: .gray,
                url: "http://localhost:8002/settings",
                badge: 0,
                isNew: false
            ),
        ]
    }

    // MARK: - 打开H5页面
    private func openH5Page(_ item: WorkbenchItem) {
        // 这里会打开WebView显示H5内容
        print("打开H5页面: \(item.name) - \(item.url)")
        // 实际实现中会导航到WebView
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
                        .font(.title2)
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
                            .font(.caption2)
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
                        .font(.title3)
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
