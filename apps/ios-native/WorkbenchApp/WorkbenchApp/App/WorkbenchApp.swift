import SwiftUI
import UserNotifications

// MARK: - 主应用结构 (支持 iOS 13.0+)

@main
struct WorkbenchApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .onAppear {
                    // 启动时配置
                    setupApplication()
                }
                .preferredColorScheme(.light) // 强制浅色模式
        }
    }
    
    private func setupApplication() {
        // 这里可以添加应用启动时的配置
    }
}

// MARK: - App Delegate

class AppDelegate: NSObject, UIApplicationDelegate, UNUserNotificationCenterDelegate {
    
    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        
        // 配置推送通知
        configurePushNotifications(application)
        
        // 配置网络监控
        NetworkMonitor.shared.startMonitoring()
        
        // 设置状态栏样式
        if #available(iOS 13.0, *) {
            // iOS 13+ 使用 SceneDelegate 处理状态栏
        } else {
            // iOS 12 及以下版本
            UIApplication.shared.statusBarStyle = .default
        }
        
        // 强制全屏显示
        DispatchQueue.main.async {
            if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
               let window = windowScene.windows.first {
                window.backgroundColor = UIColor.white
                window.isOpaque = true
                // 强制设置窗口框架
                window.frame = UIScreen.main.bounds
            }
        }
        
        return true
    }
    
    // MARK: - UISceneSession Lifecycle
    
    func application(
        _ application: UIApplication,
        configurationForConnecting connectingSceneSession: UISceneSession,
        options: UIScene.ConnectionOptions
    ) -> UISceneConfiguration {
        let configuration = UISceneConfiguration(
            name: "Default Configuration",
            sessionRole: connectingSceneSession.role
        )
        return configuration
    }
    
    func application(
        _ application: UIApplication,
        didDiscardSceneSessions sceneSessions: Set<UISceneSession>
    ) {
        // 清理被丢弃的场景会话
    }
    
    // MARK: - Push Notifications
    
    private func configurePushNotifications(_ application: UIApplication) {
        UNUserNotificationCenter.current().delegate = self
        
        let authOptions: UNAuthorizationOptions = [.alert, .badge, .sound]
        UNUserNotificationCenter.current().requestAuthorization(
            options: authOptions
        ) { granted, error in
            if granted {
                print("通知权限已授予")
            } else if let error = error {
                print("通知权限请求失败: \(error.localizedDescription)")
            }
        }
        
        DispatchQueue.main.async {
            application.registerForRemoteNotifications()
        }
    }
    
    func application(
        _ application: UIApplication,
        didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
    ) {
        let token = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
        print("设备推送令牌: \(token)")
    }
    
    func application(
        _ application: UIApplication,
        didFailToRegisterForRemoteNotificationsWithError error: Error
    ) {
        print("注册推送失败: \(error.localizedDescription)")
    }
    
    // MARK: - UNUserNotificationCenterDelegate
    
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        // 应用在前台时显示通知
        if #available(iOS 14.0, *) {
            completionHandler([.banner, .sound, .badge])
        } else {
            completionHandler([.alert, .sound, .badge])
        }
    }
    
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        // 处理用户点击通知的操作
        let userInfo = response.notification.request.content.userInfo
        print("收到通知响应: \(userInfo)")
        
        completionHandler()
    }
}
