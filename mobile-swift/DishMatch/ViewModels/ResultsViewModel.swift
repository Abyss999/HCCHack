import Foundation

@MainActor
final class ResultsViewModel: ObservableObject {
    @Published var results: [SessionResult] = []
    @Published var isLoading = false
    @Published var vibePick: VibePick? = nil
    @Published var isLoadingVibePick = false
    @Published var selectedFitContext: PersonalizedFitContext? = nil
    @Published var isLoadingFit = false

    let sessionId: UUID
    let sessionVM: SessionViewModel
    let ws = WebSocketService()

    init(sessionId: UUID, sessionVM: SessionViewModel) {
        self.sessionId = sessionId
        self.sessionVM = sessionVM
        setupWS()
    }

    func load() async {
        isLoading = true
        defer { isLoading = false }
        try? await sessionVM.fetchResults(sessionId: sessionId)
        results = sessionVM.results
        // Vibe pick loads in background so results appear immediately
        Task { await loadVibePick() }
    }

    func loadVibePick() async {
        isLoadingVibePick = true
        defer { isLoadingVibePick = false }
        vibePick = try? await sessionVM.fetchVibePick(sessionId: sessionId)
    }

    func loadFit(for result: SessionResult) async {
        isLoadingFit = true
        defer { isLoadingFit = false }
        guard let fit = try? await sessionVM.fetchPersonalizedFit(
            restaurantId: result.restaurant.id,
            sessionId: sessionId
        ) else { return }
        selectedFitContext = PersonalizedFitContext(
            id: result.restaurant.id,
            restaurantName: result.restaurant.name,
            fit: fit
        )
    }

    private func setupWS() {
        guard let token = sessionVM.token else { return }
        ws.connect(sessionId: sessionId, token: token)
        ws.onTop3Ready = { [weak self] p in
            self?.results = p.results
        }
    }
}
