import Foundation
import UIKit

@MainActor
final class SwipeViewModel: ObservableObject {
    @Published var swipeCount = 0
    @Published var memberProgress: [UUID: Int] = [:]
    @Published var matchedRestaurant: Restaurant?
    @Published var showMatch = false
    @Published var navigateToResults = false

    let sessionId: UUID
    let sessionVM: SessionViewModel
    let ws = WebSocketService()

    init(sessionId: UUID, sessionVM: SessionViewModel) {
        self.sessionId = sessionId
        self.sessionVM = sessionVM
        setupWS()
    }

    var restaurants: [Restaurant] { sessionVM.restaurants }
    var canSeeResults: Bool { swipeCount >= 5 }

    func load() async {
        try? await sessionVM.fetchRestaurants(sessionId: sessionId)
    }

    func swipe(restaurant: Restaurant, direction: SwipeDirection) async {
        do {
            try await sessionVM.submitSwipe(
                sessionId: sessionId,
                restaurantId: restaurant.id,
                direction: direction
            )
            swipeCount += 1
        } catch {}
    }

    private func setupWS() {
        guard let token = sessionVM.token else { return }
        ws.connect(sessionId: sessionId, token: token)

        ws.onSwipeProgress = { [weak self] p in
            self?.memberProgress[p.userId] = p.swipeCount
        }
        ws.onInstantMatch = { [weak self] p in
            self?.matchedRestaurant = p.restaurant
            self?.showMatch = true
            UINotificationFeedbackGenerator().notificationOccurred(.success)
        }
        ws.onPhaseChange = { [weak self] p in
            if p.phase == .results || p.phase == .matched {
                self?.navigateToResults = true
            }
        }
        ws.onTop3Ready = { [weak self] _ in
            self?.navigateToResults = true
        }
    }
}
