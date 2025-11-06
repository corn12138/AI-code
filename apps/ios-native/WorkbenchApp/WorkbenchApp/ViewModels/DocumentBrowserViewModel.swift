import Foundation
import Combine

class DocumentBrowserViewModel: ObservableObject {
    @Published var documents: [MobileDoc] = []
    @Published var searchResults: [MobileDoc] = []
    @Published var isLoading = false
    @Published var isSearching = false
    @Published var hasMore = false
    @Published var selectedDocument: MobileDoc?
    @Published var errorMessage: String?
    
    private let apiService = APIService.shared
    private var cancellables = Set<AnyCancellable>()
    
    private var currentPage = 1
    private var currentCategory = "latest"
    private let pageSize = 10
    
    // MARK: - Public Methods
    
    func loadDocuments(category: String) {
        currentCategory = category
        currentPage = 1
        documents = []
        
        let params = QueryParams(
            page: currentPage,
            pageSize: pageSize,
            category: category == "latest" ? nil : category,
            search: nil,
            tag: nil,
            isHot: nil,
            published: true
        )
        
        isLoading = true
        errorMessage = nil
        
        apiService.getDocs(params: params)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] (completion: Subscribers.Completion<Error>) in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] result in
                    self?.documents = result.items
                    self?.hasMore = result.hasMore
                }
            )
            .store(in: &cancellables)
    }
    
    func loadMore() {
        guard hasMore && !isLoading else { return }
        
        currentPage += 1
        
        let params = QueryParams(
            page: currentPage,
            pageSize: pageSize,
            category: currentCategory == "latest" ? nil : currentCategory,
            search: nil,
            tag: nil,
            isHot: nil,
            published: true
        )
        
        isLoading = true
        
        apiService.getDocs(params: params)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] (completion: Subscribers.Completion<Error>) in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] result in
                    self?.documents.append(contentsOf: result.items)
                    self?.hasMore = result.hasMore
                }
            )
            .store(in: &cancellables)
    }
    
    func searchDocuments(query: String) {
        guard !query.isEmpty else { return }
        
        isSearching = true
        searchResults = []
        
        let params = QueryParams(
            page: 1,
            pageSize: 20,
            category: nil,
            search: query,
            tag: nil,
            isHot: nil,
            published: true
        )
        apiService.searchDocs(query: query, params: params)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] (completion: Subscribers.Completion<Error>) in
                    self?.isSearching = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] result in
                    self?.searchResults = result.items
                }
            )
            .store(in: &cancellables)
    }
    
    func clearSearch() {
        searchResults = []
        isSearching = false
    }
    
    func loadHotDocuments() {
        isLoading = true
        errorMessage = nil
        
        let params = QueryParams(
            page: 1,
            pageSize: 10,
            category: nil,
            search: nil,
            tag: nil,
            isHot: true,
            published: true
        )
        apiService.getDocs(params: params)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] (completion: Subscribers.Completion<Error>) in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] result in
                    self?.documents = result.items
                }
            )
            .store(in: &cancellables)
    }
    
    func loadDocumentsByCategory(_ category: String) {
        currentCategory = category
        currentPage = 1
        documents = []
        
        let params = QueryParams(
            page: currentPage,
            pageSize: pageSize,
            category: category,
            search: nil,
            tag: nil,
            isHot: nil,
            published: true
        )
        
        isLoading = true
        errorMessage = nil
        
        apiService.getDocs(params: params)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] (completion: Subscribers.Completion<Error>) in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] result in
                    self?.documents = result.items
                    self?.hasMore = result.hasMore
                }
            )
            .store(in: &cancellables)
    }
    
    func refresh() {
        loadDocuments(category: currentCategory)
    }
    
    // MARK: - Private Methods
    
    private func handleError(_ error: Error) {
        DispatchQueue.main.async {
            self.errorMessage = error.localizedDescription
            self.isLoading = false
        }
    }
}
