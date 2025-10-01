import SwiftUI

struct ContentView: View {
    var body: some View {
        NavigationView {
            WebViewContainer()
                .navigationTitle("AI技术文章阅读")
                .navigationBarTitleDisplayMode(.inline)
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
}
