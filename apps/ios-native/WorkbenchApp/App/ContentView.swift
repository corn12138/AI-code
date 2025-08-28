import SwiftUI

struct ContentView: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem {
                    Image(systemName: "house.fill")
                    Text("首页")
                }
                .tag(0)

            WorkbenchView()
                .tabItem {
                    Image(systemName: "briefcase.fill")
                    Text("工作台")
                }
                .tag(1)

            MessageView()
                .tabItem {
                    Image(systemName: "message.fill")
                    Text("消息")
                }
                .tag(2)

            ProfileView()
                .tabItem {
                    Image(systemName: "person.fill")
                    Text("我的")
                }
                .tag(3)
        }
        .accentColor(.blue)
    }
}
