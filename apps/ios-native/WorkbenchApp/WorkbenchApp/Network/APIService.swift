import Foundation
import Combine

// MARK: - API Models
struct MobileDoc: Codable, Identifiable {
    let id: String
    let title: String
    let summary: String
    let content: String
    let category: String
    let tags: [String]
    let author: String
    let isHot: Bool
    let published: Bool
    let sortOrder: Int
    let createdAt: String
    let updatedAt: String
    let filePath: String?
}

struct PaginatedResult<T: Codable>: Codable {
    let items: [T]
    let total: Int
    let page: Int
    let pageSize: Int
    let hasMore: Bool
}

struct CategoryStats: Codable {
    let value: String
    let label: String
    let count: Int
}

struct StatsResponse: Codable {
    let total: Int
    let published: Int
    let draft: Int
    let hot: Int
    let categories: [CategoryStats]
    let lastUpdated: String
}

// MARK: - Query Parameters
struct QueryParams {
    let page: Int
    let pageSize: Int
    let category: String?
    let search: String?
    let tag: String?
    let isHot: Bool?
    let published: Bool?
    
    func toQueryItems() -> [URLQueryItem] {
        var items: [URLQueryItem] = []
        
        items.append(URLQueryItem(name: "page", value: String(page)))
        items.append(URLQueryItem(name: "pageSize", value: String(pageSize)))
        
        if let category = category {
            items.append(URLQueryItem(name: "category", value: category))
        }
        
        if let search = search {
            items.append(URLQueryItem(name: "search", value: search))
        }
        
        if let tag = tag {
            items.append(URLQueryItem(name: "tag", value: tag))
        }
        
        if let isHot = isHot {
            items.append(URLQueryItem(name: "isHot", value: String(isHot)))
        }
        
        if let published = published {
            items.append(URLQueryItem(name: "published", value: String(published)))
        }
        
        return items
    }
}

// MARK: - HTTP Methods
enum HTTPMethod: String {
    case GET = "GET"
    case POST = "POST"
    case PUT = "PUT"
    case DELETE = "DELETE"
}

// MARK: - API Errors
enum APIError: Error, LocalizedError {
    case invalidURL
    case noData
    case decodingError
    case networkError(String)
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "无效的URL"
        case .noData:
            return "没有数据"
        case .decodingError:
            return "数据解析错误"
        case .networkError(let message):
            return "网络错误: \(message)"
        }
    }
}

// MARK: - API Service
class APIService: ObservableObject {
    static let shared = APIService()
    
    private let baseURL = "http://192.168.1.3:3001/api"  // 主服务器端口 3001
    private let fallbackURL = "http://192.168.1.3:3000/api"  // 备用服务器端口 3000
    private let session = URLSession.shared
    
    private init() {}
    
    // MARK: - Generic Request Method
    private func request<T: Codable>(
        endpoint: String,
        method: HTTPMethod = .GET,
        body: Data? = nil,
        queryItems: [URLQueryItem] = []
    ) -> AnyPublisher<T, Error> {
        
        guard var urlComponents = URLComponents(string: "\(baseURL)\(endpoint)") else {
            return Fail(error: APIError.invalidURL)
                .eraseToAnyPublisher()
        }
        
        if !queryItems.isEmpty {
            urlComponents.queryItems = queryItems
        }
        
        guard let url = urlComponents.url else {
            return Fail(error: APIError.invalidURL)
                .eraseToAnyPublisher()
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method.rawValue
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.timeoutInterval = 10.0  // 10秒超时
        
        if let body = body {
            request.httpBody = body
        }
        
        return session.dataTaskPublisher(for: request)
            .tryMap { data, response in
                // 检查 HTTP 状态码
                guard let httpResponse = response as? HTTPURLResponse else {
                    throw APIError.networkError("无效的响应")
                }
                
                guard httpResponse.statusCode == 200 else {
                    throw APIError.networkError("HTTP错误: \(httpResponse.statusCode)")
                }
                
                // 检查数据是否为空
                guard !data.isEmpty else {
                    throw APIError.noData
                }
                
                return data
            }
            .decode(type: T.self, decoder: JSONDecoder())
            .receive(on: DispatchQueue.main)
            .catch { error in
                // 如果网络请求失败，返回模拟数据
                print("网络请求失败，返回模拟数据: \(error.localizedDescription)")
                return self.getMockDataForEndpoint(endpoint: endpoint, queryItems: queryItems) as AnyPublisher<T, Error>
            }
            .eraseToAnyPublisher()
    }
    
    // MARK: - Mock Data Fallback
    private func getMockDataForEndpoint<T: Codable>(endpoint: String, queryItems: [URLQueryItem]) -> AnyPublisher<T, Error> {
        // 根据端点返回不同的模拟数据
        if endpoint.contains("/mobile/docs") {
            let mockDocs = createMockDocs()
            return Just(mockDocs as! T)
                .setFailureType(to: Error.self)
                .eraseToAnyPublisher()
        } else if endpoint.contains("/mobile/stats") {
            let mockStats = createMockStats()
            return Just(mockStats as! T)
                .setFailureType(to: Error.self)
                .eraseToAnyPublisher()
        } else {
            return Fail(error: APIError.noData)
                .eraseToAnyPublisher()
        }
    }
    
    // MARK: - Mock Data Creation
    private func createMockDocs() -> PaginatedResult<MobileDoc> {
        let mockDocs = [
            MobileDoc(
                id: "1",
                title: "iOS 开发最佳实践",
                summary: "介绍 iOS 开发中的最佳实践和设计模式",
                content: "在 iOS 开发中，遵循最佳实践是非常重要的...",
                category: "mobile",
                tags: ["iOS", "Swift", "最佳实践"],
                author: "张三",
                isHot: true,
                published: true,
                sortOrder: 1,
                createdAt: "2024-01-15T10:00:00.000Z",
                updatedAt: "2024-01-15T10:00:00.000Z",
                filePath: nil
            ),
            MobileDoc(
                id: "2",
                title: "SwiftUI 进阶技巧",
                summary: "深入探讨 SwiftUI 的高级用法和性能优化",
                content: "SwiftUI 是苹果推出的现代 UI 框架...",
                category: "frontend",
                tags: ["SwiftUI", "iOS", "UI"],
                author: "李四",
                isHot: false,
                published: true,
                sortOrder: 2,
                createdAt: "2024-01-14T15:30:00.000Z",
                updatedAt: "2024-01-14T15:30:00.000Z",
                filePath: nil
            )
        ]
        
        return PaginatedResult(
            items: mockDocs,
            total: mockDocs.count,
            page: 1,
            pageSize: 10,
            hasMore: false
        )
    }
    
    private func createMockStats() -> StatsResponse {
        return StatsResponse(
            total: 25,
            published: 20,
            draft: 5,
            hot: 3,
            categories: [
                CategoryStats(value: "mobile", label: "移动端", count: 8),
                CategoryStats(value: "frontend", label: "前端", count: 7),
                CategoryStats(value: "backend", label: "后端", count: 6),
                CategoryStats(value: "ai", label: "AI", count: 4)
            ],
            lastUpdated: "2024-01-15T10:00:00.000Z"
        )
    }
    
    // MARK: - Mobile Docs API
    
    /// 获取文档列表
    func getDocs(params: QueryParams) -> AnyPublisher<PaginatedResult<MobileDoc>, Error> {
        return request(endpoint: "/mobile/docs", queryItems: params.toQueryItems())
    }
    
    /// 获取文档详情
    func getDoc(id: String) -> AnyPublisher<MobileDoc, Error> {
        return request(endpoint: "/mobile/docs/\(id)")
    }
    
    /// 搜索文档
    func searchDocs(query: String, params: QueryParams) -> AnyPublisher<PaginatedResult<MobileDoc>, Error> {
        var searchParams = params
        searchParams = QueryParams(
            page: params.page,
            pageSize: params.pageSize,
            category: params.category,
            search: query,
            tag: params.tag,
            isHot: params.isHot,
            published: params.published
        )
        return request(endpoint: "/mobile/docs", queryItems: searchParams.toQueryItems())
    }
    
    /// 获取统计数据
    func getStats() -> AnyPublisher<StatsResponse, Error> {
        return request(endpoint: "/mobile/stats")
    }
    
    /// 获取分类统计
    func getCategoryStats() -> AnyPublisher<[CategoryStats], Error> {
        return request(endpoint: "/mobile/categories")
    }
}