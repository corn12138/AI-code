import SwiftUI

// MARK: - 兼容性类型定义
struct CompatibilityGridItem {
    let size: GridItemSize
    let spacing: CGFloat?
    let alignment: Alignment?
    
    enum GridItemSize {
        case flexible(minimum: CGFloat = 10, maximum: CGFloat = .infinity)
        case adaptive(minimum: CGFloat = 10, maximum: CGFloat = .infinity)
        case fixed(CGFloat)
    }
    
    @available(iOS 14.0, *)
    func toGridItem() -> GridItem {
        switch size {
        case .flexible(let minimum, let maximum):
            return GridItem(.flexible(minimum: minimum, maximum: maximum), spacing: spacing, alignment: alignment)
        case .adaptive(let minimum, let maximum):
            return GridItem(.adaptive(minimum: minimum, maximum: maximum), spacing: spacing, alignment: alignment)
        case .fixed(let value):
            return GridItem(.fixed(value), spacing: spacing, alignment: alignment)
        }
    }
}

struct CompatibilityPinnedScrollableViews {
    let headers: Bool
    let footers: Bool
    
    init(headers: Bool = false, footers: Bool = false) {
        self.headers = headers
        self.footers = footers
    }
    
    @available(iOS 14.0, *)
    func toPinnedScrollableViews() -> PinnedScrollableViews {
        var options: PinnedScrollableViews = []
        if headers { options.insert(.sectionHeaders) }
        if footers { options.insert(.sectionFooters) }
        return options
    }
}

// MARK: - iOS 版本兼容性工具类
struct CompatibilityHelper {
    
    // MARK: - 字体大小兼容性
    static func titleFont() -> Font {
        if #available(iOS 14.0, *) {
            return .title2
        } else {
            return .title
        }
    }
    
    static func subTitleFont() -> Font {
        if #available(iOS 14.0, *) {
            return .title3
        } else {
            return .headline
        }
    }
    
    static func captionFont() -> Font {
        if #available(iOS 14.0, *) {
            return .caption2
        } else {
            return .caption
        }
    }
    
    // MARK: - 字体权重兼容性
    static func compatibleFontWeight(_ weight: Font.Weight) -> Font.Weight {
        if #available(iOS 16.0, *) {
            return weight
        } else {
            // iOS 13.0-15.0 的降级处理
            return weight
        }
    }
    
    static func fontWeightFallback(_ weight: Font.Weight) -> Font {
        if #available(iOS 16.0, *) {
            return .system(size: 16, weight: weight)
        } else {
            // iOS 13.0-15.0 的降级处理
            switch weight {
            case .bold:
                return .system(size: 16, weight: .bold)
            case .semibold:
                return .system(size: 16, weight: .semibold)
            case .medium:
                return .system(size: 16, weight: .medium)
            default:
                return .system(size: 16, weight: .regular)
            }
        }
    }
    
    // MARK: - 网格布局兼容性
    @ViewBuilder
    static func LazyVGrid<Content: View>(
        columns: [CompatibilityGridItem],
        spacing: CGFloat? = nil,
        pinnedViews: CompatibilityPinnedScrollableViews = .init(),
        @ViewBuilder content: () -> Content
    ) -> some View {
        if #available(iOS 14.0, *) {
            SwiftUI.LazyVGrid(
                columns: columns.map { $0.toGridItem() },
                spacing: spacing,
                pinnedViews: pinnedViews.toPinnedScrollableViews(),
                content: content
            )
        } else {
            // iOS 13.0 的降级处理：使用 VStack + HStack 模拟
            VStack(spacing: spacing ?? 8) {
                content()
            }
        }
    }
    
    // MARK: - 网格项兼容性
    static func GridItem(
        _ size: CompatibilityGridItem.GridItemSize,
        spacing: CGFloat? = nil,
        alignment: Alignment? = nil
    ) -> CompatibilityGridItem {
        return CompatibilityGridItem(
            size: size,
            spacing: spacing,
            alignment: alignment
        )
    }
    
    // MARK: - 系统版本检测
    static func isIOS14OrLater() -> Bool {
        if #available(iOS 14.0, *) {
            return true
        } else {
            return false
        }
    }
    
    static func isIOS16OrLater() -> Bool {
        if #available(iOS 16.0, *) {
            return true
        } else {
            return false
        }
    }
    
    // MARK: - 条件视图构建器
    @ViewBuilder
    static func conditionalView<TrueContent: View, FalseContent: View>(
        condition: Bool,
        @ViewBuilder trueContent: () -> TrueContent,
        @ViewBuilder falseContent: () -> FalseContent
    ) -> some View {
        if condition {
            trueContent()
        } else {
            falseContent()
        }
    }
    
    // MARK: - 字体样式兼容性
    static func compatibleFont(
        size: CGFloat,
        weight: Font.Weight = .regular,
        design: Font.Design = .default
    ) -> Font {
        if #available(iOS 16.0, *) {
            return .system(size: size, weight: weight, design: design)
        } else {
            return .system(size: size, weight: weight)
        }
    }
    
    // MARK: - 颜色兼容性
    static func compatibleColor(_ color: Color) -> Color {
        return color
    }
    
    // MARK: - 动画兼容性
    static func compatibleAnimation(_ animation: Animation) -> Animation {
        return animation
    }
    
    // MARK: - 手势兼容性
    @ViewBuilder
    static func compatibleTapGesture<Content: View>(
        @ViewBuilder content: () -> Content,
        action: @escaping () -> Void
    ) -> some View {
        if #available(iOS 14.0, *) {
            content()
                .onTapGesture(perform: action)
        } else {
            content()
                .onTapGesture(perform: action)
        }
    }
}

// MARK: - 扩展方法
extension View {
    
    // 兼容性字体修饰符
    func compatibleFont(
        size: CGFloat,
        weight: Font.Weight = .regular,
        design: Font.Design = .default
    ) -> some View {
        if #available(iOS 16.0, *) {
            return self.font(.system(size: size, weight: weight, design: design))
        } else {
            return self.font(.system(size: size, weight: weight))
        }
    }
    
    // 兼容性标题修饰符
    func compatibleTitle() -> some View {
        if #available(iOS 14.0, *) {
            return self.font(.title2)
        } else {
            return self.font(.title)
        }
    }
    
    // 兼容性副标题修饰符
    func compatibleSubtitle() -> some View {
        if #available(iOS 14.0, *) {
            return self.font(.title3)
        } else {
            return self.font(.headline)
        }
    }
    
    // 兼容性小字修饰符
    func compatibleCaption() -> some View {
        if #available(iOS 14.0, *) {
            return self.font(.caption2)
        } else {
            return self.font(.caption)
        }
    }
    
    // 兼容性字体权重修饰符
    func compatibleFontWeight(_ weight: Font.Weight) -> some View {
        if #available(iOS 16.0, *) {
            return self.fontWeight(weight)
        } else {
            // iOS 13.0-15.0 的降级处理：使用字体大小和权重
            return self.font(.system(size: 16, weight: weight))
        }
    }
}
