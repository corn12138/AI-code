import SwiftUI

struct DocumentBrowserView: View {
    @StateObject private var viewModel = DocumentBrowserViewModel()
    @State private var selectedCategory = "latest"
    @State private var searchText = ""
    @State private var showingSearch = false
    
    let categories = [
        ("latest", "最新"),
        ("frontend", "前端"),
        ("backend", "后端"),
        ("ai", "AI"),
        ("mobile", "移动端"),
        ("design", "设计")
    ]
    
    var body: some View {
        VStack(spacing: 0) {
            // 搜索栏
            searchSection
            
            // 分类选择
            categorySection
            
            // 内容区域
            contentSection
        }
        .ignoresSafeArea(.all, edges: .all)
        .navigationTitle("技术文章")
        .navigationBarTitleDisplayMode(.large)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button("搜索") {
                    showingSearch.toggle()
                }
            }
        }
        .sheet(isPresented: $showingSearch) {
            SearchView(viewModel: viewModel)
        }
        .onAppear {
            viewModel.loadDocuments(category: selectedCategory)
        }
        .onChange(of: selectedCategory) { newCategory in
            viewModel.loadDocuments(category: newCategory)
        }
    }
    
    // MARK: - Search Section
    private var searchSection: some View {
        HStack {
            HStack {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(.secondary)
                
                TextField("搜索文章...", text: $searchText)
                    .textFieldStyle(PlainTextFieldStyle())
                
                if !searchText.isEmpty {
                    Button("取消") {
                        searchText = ""
                        viewModel.clearSearch()
                    }
                    .foregroundColor(.blue)
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(
                RoundedRectangle(cornerRadius: 10)
                    .fill(Color(.systemGray6))
            )
            
            if !searchText.isEmpty {
                Button("搜索") {
                    viewModel.searchDocuments(query: searchText)
                }
                .foregroundColor(.blue)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
    }
    
    // MARK: - Category Section
    private var categorySection: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                ForEach(categories, id: \.0) { category in
                    CategoryButton(
                        title: category.1,
                        isSelected: selectedCategory == category.0
                    ) {
                        selectedCategory = category.0
                    }
                }
            }
            .padding(.horizontal, 16)
        }
        .padding(.vertical, 8)
    }
    
    // MARK: - Content Section
    private var contentSection: some View {
        Group {
            if viewModel.isLoading {
                loadingView
            } else if viewModel.documents.isEmpty {
                emptyView
            } else {
                documentListView
            }
        }
    }
    
    // MARK: - Loading View
    private var loadingView: some View {
        VStack(spacing: 16) {
            ProgressView()
                .scaleEffect(1.2)
            
            Text("加载中...")
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemBackground))
    }
    
    // MARK: - Empty View
    private var emptyView: some View {
        VStack(spacing: 16) {
            Image(systemName: "doc.text")
                .font(.system(size: 48))
                .foregroundColor(.secondary)
            
            Text("暂无文章")
                .font(.headline)
                .foregroundColor(.secondary)
            
            Text("该分类下还没有文章")
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemBackground))
    }
    
    // MARK: - Document List View
    private var documentListView: some View {
        ScrollView {
            LazyVStack(spacing: 12) {
                ForEach(viewModel.documents) { doc in
                    DocumentCard(doc: doc) {
                        viewModel.selectedDocument = doc
                    }
                }
                
                // 加载更多
                if viewModel.hasMore && !viewModel.isLoading {
                    Button("加载更多") {
                        viewModel.loadMore()
                    }
                    .padding()
                    .foregroundColor(.blue)
                }
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 20)
        }
        .sheet(item: $viewModel.selectedDocument) { doc in
            DocumentDetailView(doc: doc)
        }
    }
}

// MARK: - Category Button
struct CategoryButton: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.subheadline)
                .compatibleFontWeight(.medium)
                .foregroundColor(isSelected ? .white : .primary)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(
                    RoundedRectangle(cornerRadius: 20)
                        .fill(isSelected ? Color.blue : Color(.systemGray6))
                )
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - Document Card
struct DocumentCard: View {
    let doc: MobileDoc
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: 12) {
                // 标题和热门标识
                HStack {
                    Text(doc.title)
                        .font(.headline)
                        .compatibleFontWeight(.semibold)
                        .foregroundColor(.primary)
                        .multilineTextAlignment(.leading)
                        .lineLimit(2)
                    
                    Spacer()
                    
                    if doc.isHot {
                        HStack(spacing: 4) {
                            Image(systemName: "flame.fill")
                                .foregroundColor(.orange)
                                .font(.caption)
                            
                            Text("热门")
                                .font(.caption)
                                .foregroundColor(.orange)
                                .compatibleFontWeight(.medium)
                        }
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color.orange.opacity(0.1))
                        )
                    }
                }
                
                // 摘要
                Text(doc.summary)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.leading)
                    .lineLimit(3)
                
                // 标签
                if !doc.tags.isEmpty {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(doc.tags, id: \.self) { tag in
                                Text(tag)
                                    .font(.caption)
                                    .foregroundColor(.blue)
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 4)
                                    .background(
                                        RoundedRectangle(cornerRadius: 8)
                                            .fill(Color.blue.opacity(0.1))
                                    )
                            }
                        }
                        .padding(.horizontal, 1)
                    }
                }
                
                // 底部信息
                HStack {
                    // 分类
                    Text(getCategoryLabel(doc.category))
                        .font(.caption)
                        .foregroundColor(.blue)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(
                            RoundedRectangle(cornerRadius: 8)
                                .fill(Color.blue.opacity(0.1))
                        )
                    
                    Spacer()
                    
                    // 作者和时间
                    VStack(alignment: .trailing, spacing: 2) {
                        Text(doc.author)
                            .font(.caption)
                            .foregroundColor(.secondary)
                        
                        Text(formatDate(doc.createdAt))
                                .compatibleCaption()
                            .foregroundColor(.secondary)
                    }
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
    
    private func getCategoryLabel(_ category: String) -> String {
        let labels: [String: String] = [
            "latest": "最新",
            "frontend": "前端",
            "backend": "后端",
            "ai": "AI",
            "mobile": "移动端",
            "design": "设计"
        ]
        return labels[category] ?? category
    }
    
    private func formatDate(_ dateString: String) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSSSS'Z'"
        
        if let date = formatter.date(from: dateString) {
            let displayFormatter = DateFormatter()
            displayFormatter.dateFormat = "MM-dd"
            return displayFormatter.string(from: date)
        }
        
        return dateString
    }
}

// MARK: - Search View
struct SearchView: View {
    @ObservedObject var viewModel: DocumentBrowserViewModel
    @Environment(\.presentationMode) private var presentationMode
    @State private var searchText = ""
    
    var body: some View {
        GeometryReader { geometry in
            VStack(spacing: 0) {
                // 搜索栏
                HStack {
                    TextField("搜索文章标题、内容...", text: $searchText)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                    
                    Button("搜索") {
                        viewModel.searchDocuments(query: searchText)
                    }
                    .disabled(searchText.isEmpty)
                }
                .padding()
                
                // 搜索结果
                if viewModel.isSearching {
                    if viewModel.searchResults.isEmpty {
                        emptySearchView
                    } else {
                        searchResultsView
                    }
                } else {
                    Text("输入关键词搜索文章")
                        .foregroundColor(.secondary)
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .navigationTitle("搜索文章")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("完成") {
                        presentationMode.wrappedValue.dismiss()
                    }
                }
            }
        }
    }
    
    private var emptySearchView: some View {
        VStack(spacing: 16) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 48))
                .foregroundColor(.secondary)
            
            Text("未找到相关文章")
                .font(.headline)
                .foregroundColor(.secondary)
            
            Text("试试其他关键词")
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    
    private var searchResultsView: some View {
        ScrollView {
            LazyVStack(spacing: 12) {
                ForEach(viewModel.searchResults) { doc in
                    DocumentCard(doc: doc) {
                        viewModel.selectedDocument = doc
                    }
                }
            }
            .padding(.horizontal, 16)
        }
        .sheet(item: $viewModel.selectedDocument) { doc in
            DocumentDetailView(doc: doc)
        }
    }
}

// MARK: - Document Detail View
struct DocumentDetailView: View {
    let doc: MobileDoc
    @Environment(\.presentationMode) private var presentationMode
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // 标题
                Text(doc.title)
                    .font(.title)
                    .compatibleFontWeight(.bold)
                    .foregroundColor(.primary)
                
                // 元信息
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text("作者: \(doc.author)")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                        
                        Spacer()
                        
                        Text(formatDate(doc.createdAt))
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    
                    if !doc.tags.isEmpty {
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 8) {
                                ForEach(doc.tags, id: \.self) { tag in
                                    Text(tag)
                                        .font(.caption)
                                        .foregroundColor(.blue)
                                        .padding(.horizontal, 8)
                                        .padding(.vertical, 4)
                                        .background(
                                            RoundedRectangle(cornerRadius: 8)
                                                .fill(Color.blue.opacity(0.1))
                                        )
                                }
                            }
                        }
                    }
                }
                
                // 内容
                Text(doc.content)
                    .font(.body)
                    .foregroundColor(.primary)
                    .lineSpacing(4)
            }
            .padding(20)
        }
        .ignoresSafeArea(.all, edges: .all)
        .navigationTitle("文章详情")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button("完成") {
                    presentationMode.wrappedValue.dismiss()
                }
            }
        }
    }
    
    private func formatDate(_ dateString: String) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSSSS'Z'"
        
        if let date = formatter.date(from: dateString) {
            let displayFormatter = DateFormatter()
            displayFormatter.dateFormat = "yyyy年MM月dd日"
            return displayFormatter.string(from: date)
        }
        
        return dateString
    }
}

#Preview {
    DocumentBrowserView()
}
