import Foundation
import CoreLocation

@MainActor
final class HomeViewModel: ObservableObject {
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var createdSession: Session?
    @Published var joinedSession: Session?

    private let sessionVM: SessionViewModel

    init(sessionVM: SessionViewModel) {
        self.sessionVM = sessionVM
    }

    func createSession() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            createdSession = try await sessionVM.createSession(lat: 0, lng: 0)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func joinSession(code: String) async {
        guard code.count == 4 else {
            errorMessage = "Please enter a 4-character code."
            return
        }
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            joinedSession = try await sessionVM.joinSession(code: code)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
