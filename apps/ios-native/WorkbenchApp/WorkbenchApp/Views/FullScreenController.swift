import SwiftUI
import UIKit

struct FullScreenController: UIViewControllerRepresentable {
    let content: AnyView
    
    init<Content: View>(@ViewBuilder content: () -> Content) {
        self.content = AnyView(content())
    }
    
    func makeUIViewController(context: Context) -> UIViewController {
        let controller = FullScreenViewController()
        let hostingController = UIHostingController(rootView: content)
        
        // 添加 SwiftUI 视图作为子视图
        controller.addChild(hostingController)
        controller.view.addSubview(hostingController.view)
        hostingController.didMove(toParent: controller)
        
        // 设置约束确保占满整个屏幕
        hostingController.view.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            hostingController.view.topAnchor.constraint(equalTo: controller.view.topAnchor),
            hostingController.view.leadingAnchor.constraint(equalTo: controller.view.leadingAnchor),
            hostingController.view.trailingAnchor.constraint(equalTo: controller.view.trailingAnchor),
            hostingController.view.bottomAnchor.constraint(equalTo: controller.view.bottomAnchor)
        ])
        
        return controller
    }
    
    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {
        // 更新视图
    }
}

class FullScreenViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // 强制全屏显示
        view.backgroundColor = UIColor.white
        
        // 隐藏导航栏
        navigationController?.setNavigationBarHidden(true, animated: false)
        
        // 设置状态栏样式
        setNeedsStatusBarAppearanceUpdate()
    }
    
    override var prefersStatusBarHidden: Bool {
        return false
    }
    
    override var preferredStatusBarStyle: UIStatusBarStyle {
        return .default
    }
    
    override var preferredScreenEdgesDeferringSystemGestures: UIRectEdge {
        return []
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        // 强制全屏
        DispatchQueue.main.async {
            print("🔧 FullScreenController: 设置视图框架为 \(UIScreen.main.bounds)")
            self.view.frame = UIScreen.main.bounds
            self.view.backgroundColor = UIColor.white
            print("🔧 FullScreenController: 视图框架现在是 \(self.view.frame)")
        }
    }
    
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        
        // 确保视图占满整个屏幕
        print("🔧 FullScreenController: viewDidLayoutSubviews - 当前框架: \(view.frame)")
        print("🔧 FullScreenController: 屏幕边界: \(UIScreen.main.bounds)")
        view.frame = UIScreen.main.bounds
        print("🔧 FullScreenController: 设置后框架: \(view.frame)")
    }
}
