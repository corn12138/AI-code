import Foundation

class APIService {
    private let baseURL = "http://localhost:3001"
    private let session = URLSession.shared
    
    func fetchArticles(category: String? = nil, page: Int = 1, pageSize: Int = 10) async throws -> [String: Any] {
        var urlComponents = URLComponents(string: "\(baseURL)/api/mobile/docs")!
        var queryItems: [URLQueryItem] = [
            URLQueryItem(name: "page", value: String(page)),
            URLQueryItem(name: "pageSize", value: String(pageSize))
        ]
        
        if let category = category, !category.isEmpty && category != "latest" {
            queryItems.append(URLQueryItem(name: "category", value: category))
        }
        
        urlComponents.queryItems = queryItems
        
        guard let url = urlComponents.url else {
            throw APIError.invalidURL
        }
        
        let (data, response) = try await session.data(from: url)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw APIError.networkError
        }
        
        guard let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            throw APIError.invalidResponse
        }
        
        return json
    }
    
    func fetchArticleById(articleId: String) async throws -> [String: Any] {
        guard let url = URL(string: "\(baseURL)/api/mobile/docs/\(articleId)") else {
            throw APIError.invalidURL
        }
        
        let (data, response) = try await session.data(from: url)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw APIError.networkError
        }
        
        guard let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            throw APIError.invalidResponse
        }
        
        return json
    }
}

enum APIError: Error {
    case invalidURL
    case networkError
    case invalidResponse
    
    var localizedDescription: String {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .networkError:
            return "Network error"
        case .invalidResponse:
            return "Invalid response"
        }
    }
}
